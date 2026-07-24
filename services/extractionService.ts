import { supabase } from '@/services/supabase';
import { HomeSystem, TaskSeverity } from '@/types';

type ExtractedTask = {
  title: string;
  dueDate: string | null;
  system?: HomeSystem | null;
  severity?: TaskSeverity | null;
  location?: string | null;
  issue?: string | null;
  fixRecommendation?: string | null;
  costMin?: number | null;
  costMax?: number | null;
  timingNote?: string | null;
};

/**
 * Calls the ExtractTasksUsingLLM Supabase Edge Function.
 * Uploads a file path + optional description and returns AI-extracted tasks.
 *
 * See supabase/functions/ExtractTasksUsingLLM/index.ts for the reference prompt
 * that populates the system/severity/location/issue/fixRecommendation/cost/timing
 * fields below — the deployed function must be updated to match before these
 * fields will actually come back populated.
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
