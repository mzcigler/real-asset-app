import { supabase } from '@/lib/supabase';
import { FileRecord } from '@/types';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

/** Fetch all files for a property */
export async function fetchFilesForProperty(propertyId: string): Promise<FileRecord[]> {
  const { data } = await supabase
    .from('files')
    .select('id, file_name, file_path')
    .eq('property_id', propertyId);
  return data || [];
}

/**
 * Delete files from storage and cascade-delete their tasks and DB records.
 * Accepts the full FileRecord objects so we can remove the storage blobs.
 */
export async function deleteFiles(files: FileRecord[]): Promise<void> {
  const paths = files.map((f) => f.file_path).filter(Boolean);
  if (paths.length > 0) {
    await supabase.storage.from('user_files').remove(paths);
  }
  const ids = files.map((f) => f.id);
  await supabase.from('tasks').delete().in('file_id', ids);
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
