// ─── Domain Types ────────────────────────────────────────────────────────────

export type Property = {
  id: string;
  name: string;
};

export type RecurFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type RecurAnchor = 'due_date' | 'completion';

/** Normalised severity scale. Mirrors SEVERITIES in the ExtractTasksAndImages function. */
export const SEVERITIES = ['critical', 'high', 'medium', 'low', 'informational'] as const;
export type Severity = (typeof SEVERITIES)[number];

/** A task as returned by the ExtractTasksAndImages edge function. */
export type ExtractedTask = {
  title: string;
  dueDate: string | null;
  severity: Severity | null;
  /** The document's own wording ("Urgent", "C3"), kept so its scale is not lost. */
  severityLabel: string | null;
  moreInfo: string | null;
  /** Storage paths in the user_files bucket. */
  imageRefs: string[];
  sourcePages: number[];
};

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
  severity?: Severity | null;
  severityLabel?: string | null;
  moreInfo?: string | null;
  imageRefs?: string[];
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
  severity: Severity | null;
  more_info: string | null;
  image_refs: string[] | null;
};

/** DBTask enriched with the property name (used on dashboard) */
export type TaskRow = DBTask & {
  propertyName: string;
  fileName: string;
};

export type StandardFeature = {
  id: number;
  name: string;
  keywords: string[] | null;
};

/** Raw DB row from the files table */
export type FileRecord = {
  id: string;
  file_name: string;
  file_path: string;
  property_id: string | null;
};
