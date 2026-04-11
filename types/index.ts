// ─── Domain Types ────────────────────────────────────────────────────────────

export type Property = {
  id: string;
  name: string;
};

export type RecurFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type RecurAnchor = 'due_date' | 'completion';

/** Shape used in UI (camelCase dates, optional fields) */
export type TaskType = {
  id?: string;
  title: string;
  description?: string;
  dueDate?: Date | null;
  propertyId?: string | null;
  fileId?: string | null;
  recurFrequency?: RecurFrequency | null;
  recurAnchor?: RecurAnchor | null;
};

/** Raw DB row from the tasks table */
export type DBTask = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  user_id: string;
  property_id: string | null;
  file_id: string | null;
  recur_frequency: RecurFrequency | null;
  recur_anchor: RecurAnchor | null;
  completed_at: string | null;
};

/** DBTask enriched with the property name (used on dashboard) */
export type TaskRow = DBTask & {
  propertyName: string;
  fileName: string;
};

/** Raw DB row from the files table */
export type FileRecord = {
  id: string;
  file_name: string;
  file_path: string;
  property_id: string | null;
};
