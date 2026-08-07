import { supabase } from '@/services/supabase';
import { FileRecord } from '@/types';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

/** Fetch all files for a property */
export async function fetchFilesForProperty(propertyId: string): Promise<FileRecord[]> {
  const { data } = await supabase
    .from('files')
    .select('id, file_name, file_path, property_id')
    .eq('property_id', propertyId);
  return data || [];
}

/**
 * Returns a deduplicated display name for a file within a user's files.
 * If "report.pdf" exists, returns "report (1).pdf", then "report (2).pdf", etc.
 */
async function resolveUniqueFileName(userId: string, fileName: string): Promise<string> {
  const { data: existing } = await supabase
    .from('files')
    .select('file_name')
    .eq('user_id', userId);

  const names = new Set((existing || []).map((f) => f.file_name));
  if (!names.has(fileName)) return fileName;

  const dot = fileName.lastIndexOf('.');
  const base = dot !== -1 ? fileName.slice(0, dot) : fileName;
  const ext = dot !== -1 ? fileName.slice(dot) : '';

  let i = 1;
  while (names.has(`${base} (${i})${ext}`)) i++;
  return `${base} (${i})${ext}`;
}

/**
 * Upload a document file to storage and insert a record in the files table.
 * Storage path: {userId}/{propertyId}/{timestamp}-{fileName}
 * Returns the new file's DB id, storage path, and resolved display name.
 */
export async function uploadPropertyFile(
  userId: string,
  propertyId: string,
  fileUri: string,
  fileName: string,
): Promise<{ id: string; filePath: string; displayName: string }> {
  const displayName = await resolveUniqueFileName(userId, fileName);
  const response = await fetch(fileUri);
  const blob = await response.blob();
  const filePath = `${userId}/${propertyId}/${Date.now()}-${displayName}`;

  const { error: uploadError } = await supabase.storage
    .from('user_files')
    .upload(filePath, blob);
  if (uploadError) throw uploadError;

  const { data, error: dbError } = await supabase
    .from('files')
    .insert({ user_id: userId, property_id: propertyId, file_path: filePath, file_name: displayName })
    .select('id')
    .single();
  if (dbError) throw dbError;

  return { id: data.id, filePath, displayName };
}

/**
 * Lists everything under a document's ".assets" folder, one level of subfolders deep
 * (images/ and layout/, plus manifest.json at the root).
 */
async function listAssetObjects(filePath: string): Promise<string[]> {
  const root = `${filePath}.assets`;
  const { data: entries } = await supabase.storage.from('user_files').list(root, { limit: 1000 });
  if (!entries?.length) return [];

  const paths: string[] = [];
  for (const entry of entries) {
    // Storage returns folders as rows with a null id.
    if (entry.id === null) {
      const { data: children } = await supabase.storage
        .from('user_files')
        .list(`${root}/${entry.name}`, { limit: 1000 });
      for (const child of children || []) paths.push(`${root}/${entry.name}/${child.name}`);
    } else {
      paths.push(`${root}/${entry.name}`);
    }
  }
  return paths;
}

/**
 * Delete files from storage and their DB records.
 * @param deleteLinkedTasks - if true, also deletes all tasks linked to these files;
 *                            if false, unlinks tasks (sets file_id = null).
 */
export async function deleteFiles(files: FileRecord[], deleteLinkedTasks = true): Promise<void> {
  const paths = files.map((f) => f.file_path).filter(Boolean);
  if (paths.length > 0) {
    // Extracted images and layout chunks live in a sibling "<path>.assets" folder.
    // Storage has no recursive delete, so they must be listed and removed explicitly or
    // they linger forever, invisible to the app but still billed.
    const assetPaths = (await Promise.all(paths.map(listAssetObjects))).flat();
    await supabase.storage.from('user_files').remove([...paths, ...assetPaths]);
  }
  const ids = files.map((f) => f.id);
  if (deleteLinkedTasks) {
    await supabase.from('tasks').delete().in('file_id', ids);
  } else {
    await supabase.from('tasks').update({ file_id: null }).in('file_id', ids);
  }
  await supabase.from('files').delete().in('id', ids);
}

/**
 * Signed URLs for images extracted from a document.
 *
 * The user_files bucket is private, so storage paths are not directly loadable by an
 * <Image>; they have to be exchanged for time-limited URLs first.
 */
export async function getSignedImageUrls(
  paths: string[],
  expiresInSeconds = 60 * 60,
): Promise<Record<string, string>> {
  if (paths.length === 0) return {};

  const { data, error } = await supabase.storage
    .from('user_files')
    .createSignedUrls(paths, expiresInSeconds);

  if (error || !data) {
    console.error('Failed to sign image URLs:', error);
    return {};
  }

  const urls: Record<string, string> = {};
  for (const entry of data) {
    if (entry.signedUrl && entry.path) urls[entry.path] = entry.signedUrl;
  }
  return urls;
}

/** Download a file — opens a save dialog on web, share sheet on native */
export async function downloadFile(filePath: string, fileName: string): Promise<void> {
  const { data, error } = await supabase.storage.from('user_files').download(filePath);
  if (error || !data) throw error || new Error('Download failed');

  if (Platform.OS === 'web') {
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(data);
  });

  const localUri = (FileSystem.cacheDirectory ?? '') + fileName;
  await FileSystem.writeAsStringAsync(localUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(localUri);
  }
}
