// ─── Domain Types ────────────────────────────────────────────────────────────

export type Property = {
  id: string;
  name: string;
};

/** Shape used in UI (camelCase dates, optional fields) */
export type TaskType = {
  id?: string;
  title: string;
  description?: string;
  dueDate?: Date | null;
  propertyId?: string | null;
  fileId?: string | null;
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
