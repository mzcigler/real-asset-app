import { supabase } from '@/services/supabase';
import { DBTask, TaskRow } from '@/types';
import { sortByDueDate, toDateString } from '@/utils/taskUtils';

/**
 * Fetch all tasks for a user, enriched with property name and file name.
 * Tasks are queried directly by user_id (no file join needed).
 */
export async function fetchAllTasksForUser(userId: string): Promise<TaskRow[]> {
  const { data: propData } = await supabase
    .from('properties')
    .select('id, name')
    .eq('user_id', userId);

  const propMap = Object.fromEntries((propData || []).map((p) => [p.id, p.name]));

  const { data: taskData } = await supabase
    .from('tasks')
    .select('id, title, description, due_date, user_id, property_id, file_id')
    .eq('user_id', userId);

  if (!taskData || taskData.length === 0) return [];

  // Fetch file names for any tasks linked to a file
  const fileIds = [...new Set(taskData.map((t) => t.file_id).filter(Boolean))] as string[];
  let fileNameMap: Record<string, string> = {};
  if (fileIds.length > 0) {
    const { data: fileData } = await supabase
      .from('files')
      .select('id, file_name')
      .in('id', fileIds);
    fileNameMap = Object.fromEntries((fileData || []).map((f) => [f.id, f.file_name as string]));
  }

  const tasks: TaskRow[] = taskData.map((t) => ({
    ...t,
    propertyName: t.property_id ? (propMap[t.property_id] || '') : '',
    fileName: t.file_id ? (fileNameMap[t.file_id] || '') : '',
  }));

  return sortByDueDate(tasks);
}

/** Fetch all tasks belonging to a property, sorted by due date */
export async function fetchTasksForProperty(propertyId: string): Promise<DBTask[]> {
  const { data } = await supabase
    .from('tasks')
    .select('id, title, description, due_date, user_id, property_id, file_id')
    .eq('property_id', propertyId);
  return sortByDueDate(data || []);
}

/**
 * Create a new task and return the inserted row.
 * user_id is mandatory; property_id and file_id are optional links.
 */
export async function createTask(
  userId: string,
  title: string,
  description: string | null,
  dueDate: Date | null,
  propertyId?: string | null,
  fileId?: string | null,
): Promise<DBTask> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      title,
      description,
      due_date: toDateString(dueDate),
      property_id: propertyId || null,
      file_id: fileId || null,
    })
    .select('id, title, description, due_date, user_id, property_id, file_id')
    .single();

  if (error || !data) throw error || new Error('Failed to create task');
  return data;
}

/** Update a task's fields */
export async function updateTask(
  id: string,
  title: string,
  description: string | null,
  dueDate: Date | null,
  propertyId?: string | null,
  fileId?: string | null,
): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update({
      title,
      description,
      due_date: toDateString(dueDate),
      property_id: propertyId !== undefined ? propertyId : undefined,
      file_id: fileId !== undefined ? fileId : undefined,
    })
    .eq('id', id);
  if (error) throw error;
}

/** Delete one or more tasks by ID */
export async function deleteTasks(ids: string[]): Promise<void> {
  const { error } = await supabase.from('tasks').delete().in('id', ids);
  if (error) throw error;
}
