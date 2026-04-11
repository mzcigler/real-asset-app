import { fetchFilesForProperty } from '@/services/fileService';
import { FileRecord } from '@/types';
import { useEffect, useState } from 'react';

/**
 * Fetches files for the given property whenever it changes.
 * Used in both AddTaskModal (dashboard mode) and TaskItem (edit mode).
 *
 * @param propertyId   - currently selected property ID (or null for none)
 * @param preloaded    - pre-loaded files passed in from the parent (property detail mode);
 *                       when present, skips fetching and uses these directly
 * @param currentFileId - currently selected file ID; cleared if it no longer belongs to the new property
 * @param onClearFile  - called when the current file no longer belongs to the selected property
 */
export function usePropertyFiles(
  propertyId: string | null,
  preloaded: FileRecord[] | undefined,
  currentFileId: string | null,
  onClearFile: () => void,
): FileRecord[] {
  const [files, setFiles] = useState<FileRecord[]>(preloaded ?? []);

  // Property detail mode: keep in sync with pre-loaded files from parent
  useEffect(() => {
    if (preloaded) setFiles(preloaded);
  }, [preloaded]);

  // Dashboard mode: fetch files when selected property changes
  useEffect(() => {
    if (preloaded) return;
    if (!propertyId) { setFiles([]); return; }
    const fileIdAtLoad = currentFileId;
    fetchFilesForProperty(propertyId).then((fetched) => {
      setFiles(fetched);
      if (fileIdAtLoad && !fetched.some((f) => f.id === fileIdAtLoad)) {
        onClearFile();
      }
    });
  }, [propertyId]); // eslint-disable-line react-hooks/exhaustive-deps

  return files;
}
