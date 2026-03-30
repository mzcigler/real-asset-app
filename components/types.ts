export type TaskType = {
  id?: string;
  title: string;
  description?: string;
  dueDate?: Date | null;
  propertyId?: string;
};