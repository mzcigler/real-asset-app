import { supabase } from "@/lib/supabase";

type Task = {
  title: string;
  due_date: string | null;
};

export const extractTasks = async (
  description: string, // file content / description
  filePath: string      // path of the file in Supabase storage
): Promise<Task[]> => {
  console.log("Description is:", description);
  console.log("File path is:", filePath);
  const payload = {
    description,   // renamed from text
    file_path: filePath
  };

  // Log it
  console.log("POST JSON to ExtractTasksUsingLLM:", JSON.stringify(payload, null, 2));
  const { data, error } = await supabase.functions.invoke<{ tasks: Task[] }>(
    'ExtractTasksUsingLLM',
    {
      body: { 
        description,  // renamed from text
        file_path: filePath
      },
    }
  );

  if (error) {
    console.error('Extract tasks error:', error);
    throw error;
  }

  return data?.tasks || [];
};