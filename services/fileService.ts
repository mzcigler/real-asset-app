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
 * Upload a document file to storage and insert a record in the files table.
 * Storage path: {userId}/{propertyId}/{timestamp}-{fileName}
 * Returns the new file's DB id and storage path.
 */
export async function uploadPropertyFile(
  userId: string,
  propertyId: string,
  fileUri: string,
  fileName: string,
): Promise<{ id: string; filePath: string }> {
  const response = await fetch(fileUri);
  const blob = await response.blob();
  const filePath = `${userId}/${propertyId}/${Date.now()}-${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('user_files')
    .upload(filePath, blob);
  if (uploadError) throw uploadError;

  const { data, error: dbError } = await supabase
    .from('files')
    .insert({ user_id: userId, property_id: propertyId, file_path: filePath, file_name: fileName })
    .select('id')
    .single();
  if (dbError) throw dbError;

  return { id: data.id, filePath };
}

/**
 * Delete files from storage and unlink them from any tasks (sets file_id to null).
 * Tasks themselves are preserved — they still exist under their property.
 */
export async function deleteFiles(files: FileRecord[]): Promise<void> {
  const paths = files.map((f) => f.file_path).filter(Boolean);
  if (paths.length > 0) {
    await supabase.storage.from('user_files').remove(paths);
  }
  const ids = files.map((f) => f.id);
  // Unlink tasks from the deleted files (keep tasks, just remove the file reference)
  await supabase.from('tasks').update({ file_id: null }).in('file_id', ids);
  await supabase.from('files').delete().in('id', ids);
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
