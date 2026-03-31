import { DBTask, TaskType } from '@/types';

/** Sort tasks ascending by due_date; nulls last */
export function sortByDueDate<T extends { due_date: string | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });
}

/** Convert a DB task row to the UI TaskType shape */
export function dbTaskToTaskType(t: DBTask): TaskType {
  return {
    id: t.id,
    title: t.title,
    description: t.description ?? undefined,
    dueDate: t.due_date ? new Date(t.due_date) : null,
  };
}

/** Format a Date (or null) to an ISO date string (YYYY-MM-DD) for the DB */
export function toDateString(date: Date | null | undefined): string | null {
  return date ? date.toISOString().slice(0, 10) : null;
}
