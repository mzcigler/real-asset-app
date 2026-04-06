import { supabase } from '@/services/supabase';

type ExtractedTask = {
  title: string;
  dueDate: string | null;
};

/**
 * Calls the ExtractTasksUsingLLM Supabase Edge Function.
 * Uploads a file path + optional description and returns AI-extracted tasks.
 */
export async function extractTasks(
  description: string,
  filePath: string,
): Promise<ExtractedTask[]> {
  const { data, error } = await supabase.functions.invoke<{ tasks: ExtractedTask[] }>(
    'ExtractTasksUsingLLM',
    {
      body: { description, file_path: filePath },
    },
  );

  if (error) {
    console.error('Extract tasks error:', error);
    throw error;
  }

  return data?.tasks || [];
}
