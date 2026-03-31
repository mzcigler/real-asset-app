import { supabase } from '@/lib/supabase';
import { DBTask, TaskRow } from '@/types';
import { sortByDueDate, toDateString } from '@/utils/taskUtils';

/**
 * Fetch all tasks across all properties for a user.
 * Returns tasks enriched with the property name, sorted by due date.
 */
export async function fetchAllTasksForUser(userId: string): Promise<TaskRow[]> {
  const { data: propData } = await supabase
    .from('properties')
    .select('id, name')
    .eq('user_id', userId);

  if (!propData || propData.length === 0) return [];

  const propMap = Object.fromEntries(propData.map((p) => [p.id, p.name]));

  const { data: fileData } = await supabase
    .from('files')
    .select('id, property_id, file_name')
    .in('property_id', propData.map((p) => p.id));

  if (!fileData || fileData.length === 0) return [];

  const fileToProperty = Object.fromEntries(fileData.map((f) => [f.id, f.property_id]));
  const fileToName = Object.fromEntries(fileData.map((f) => [f.id, f.file_name as string]));

  const { data: taskData } = await supabase
    .from('tasks')
    .select('id, title, description, due_date, file_id')
    .in('file_id', fileData.map((f) => f.id));

  const tasks: TaskRow[] = (taskData || []).map((t) => ({
    ...t,
    propertyName: propMap[fileToProperty[t.file_id]] || '',
    fileName: fileToName[t.file_id] || '',
  }));

  return sortByDueDate(tasks);
}

/** Fetch all tasks belonging to a set of file IDs, sorted by due date */
export async function fetchTasksForFiles(fileIds: string[]): Promise<DBTask[]> {
  if (fileIds.length === 0) return [];
  const { data } = await supabase
    .from('tasks')
    .select('id, title, description, due_date, file_id')
    .in('file_id', fileIds);
  return sortByDueDate(data || []);
}

/**
 * Returns the ID of the virtual "__manual__" file for a property.
 * Creates it if it doesn't exist. Used for manually-added tasks.
 */
export async function getOrCreateManualFileId(propertyId: string): Promise<string> {
  const { data: existing } = await supabase
    .from('files')
    .select('id')
    .eq('property_id', propertyId)
    .eq('file_name', '__manual__')
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from('files')
    .insert({ property_id: propertyId, file_name: '__manual__', file_path: '' })
    .select('id')
    .single();

  if (error || !created) throw new Error('Could not create manual file record');
  return created.id;
}

/** Create a new task and return the inserted row */
export async function createTask(
  fileId: string,
  title: string,
  description: string | null,
  dueDate: Date | null,
): Promise<DBTask> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({ file_id: fileId, title, description, due_date: toDateString(dueDate) })
    .select('id, title, description, due_date, file_id')
    .single();

  if (error || !data) throw error || new Error('Failed to create task');
  return data;
}

/** Update a task's title, description, and due date */
export async function updateTask(
  id: string,
  title: string,
  description: string | null,
  dueDate: Date | null,
): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update({ title, description, due_date: toDateString(dueDate) })
    .eq('id', id);
  if (error) throw error;
}

/** Delete one or more tasks by ID */
export async function deleteTasks(ids: string[]): Promise<void> {
  const { error } = await supabase.from('tasks').delete().in('id', ids);
  if (error) throw error;
}
