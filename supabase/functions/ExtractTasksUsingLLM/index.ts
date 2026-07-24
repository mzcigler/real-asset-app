// Supabase Edge Function: ExtractTasksUsingLLM
//
// REFERENCE IMPLEMENTATION — the actual deployed function's source isn't in this
// repo, so this is a fresh best-effort rewrite, not a diff. Before redeploying:
//   1. Compare against whatever is currently live (model choice, prompt wording,
//      error handling, auth checks) and merge in anything project-specific.
//   2. Confirm the storage bucket name ('user_files') and LLM provider/env vars
//      match what's actually configured in this Supabase project.
//
// What changed vs. the previous version: the prompt now also asks for each
// task's home `system`, `severity`, `location`, `issue`, `fixRecommendation`,
// `costMin`/`costMax`, and `timingNote` — the fields the redesigned dashboard's
// Home Health Score and expandable maintenance-plan cards need. All of these are
// optional; the app treats missing ones as "not yet categorized" rather than
// failing.
//
// Deploy with: supabase functions deploy ExtractTasksUsingLLM

import { createClient } from 'jsr:@supabase/supabase-js@2';

const HOME_SYSTEMS = ['roof_attic', 'electrical', 'plumbing', 'hvac', 'exterior', 'interior'] as const;
const SEVERITIES = ['critical', 'moderate', 'minor'] as const;

type ExtractedTask = {
  title: string;
  dueDate: string | null;
  system: (typeof HOME_SYSTEMS)[number] | null;
  severity: (typeof SEVERITIES)[number] | null;
  location: string | null;
  issue: string | null;
  fixRecommendation: string | null;
  costMin: number | null;
  costMax: number | null;
  timingNote: string | null;
};

const SYSTEM_PROMPT = `You are an assistant that reads home inspection reports and extracts a
prioritized maintenance task list.

For EVERY finding worth tracking, return an object with these fields:
- title: short action-oriented summary (e.g. "Reseal roof flashing at the chimney")
- dueDate: an ISO date (YYYY-MM-DD) if the report implies urgency/timing, else null
- system: one of ${HOME_SYSTEMS.join(', ')} — pick the closest match, never invent a new value
- severity: one of ${SEVERITIES.join(', ')} — "critical" = safety hazard or active damage,
  "moderate" = should be addressed soon but not urgent, "minor" = routine/cosmetic
- location: where in/on the home the issue is (e.g. "Basement, north wall")
- issue: 1-2 plain-language sentences describing what the finding actually is
- fixRecommendation: 1-2 sentences describing the recommended fix
- costMin / costMax: a rough USD estimate range as integers, or null if unknown
- timingNote: a short human-readable rationale for when to do it (e.g. "Best before
  fall rains"), or null

Return ONLY valid JSON matching: { "tasks": ExtractedTask[] }. No prose, no markdown fences.`;

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { description, file_path: filePath } = await req.json();
    if (!filePath) throw new Error('file_path is required');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from('user_files')
      .download(filePath);
    if (downloadError || !fileBlob) throw downloadError || new Error('Could not download file');

    // TODO: if the report is a PDF, swap this for real text extraction (e.g. a
    // PDF-to-text step) before handing it to the LLM — sending raw PDF bytes as
    // text will not work well for most models.
    const reportText = await fileBlob.text();

    const tasks = await callLLM(reportText, description);

    return new Response(JSON.stringify({ tasks }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('ExtractTasksUsingLLM error:', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function callLLM(reportText: string, description: string): Promise<ExtractedTask[]> {
  // TODO: confirm which LLM provider/env var this project actually uses and
  // swap the endpoint/auth below to match — this defaults to OpenAI's Chat
  // Completions API with JSON-object mode as a common baseline.
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Additional context from the user: ${description}\n\nReport contents:\n${reportText}`,
        },
      ],
    }),
  });

  if (!response.ok) throw new Error(`LLM request failed: ${response.status}`);

  const completion = await response.json();
  const content = completion.choices?.[0]?.message?.content ?? '{"tasks":[]}';
  const parsed = JSON.parse(content);
  return Array.isArray(parsed.tasks) ? parsed.tasks : [];
}
