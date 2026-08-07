import { supabase } from '@/services/supabase';
import { ExtractedTask } from '@/types';

/**
 * Progress emitted while a document is processed.
 *
 * Extraction runs as several requests rather than one because Supabase charges CPU per
 * request and excludes async I/O — PDF image decoding is synchronous work that cannot be
 * spread out, so the only way to buy more of it is another request. Each response
 * therefore doubles as a progress update, which is why this needs no streaming and
 * behaves identically on web and native.
 */
export type ExtractProgress =
  | { phase: 'uploading' }
  | { phase: 'parsing'; page: number; totalPages: number | null; images: number }
  | { phase: 'analysing' };

export function progressMessage(p: ExtractProgress): string {
  switch (p.phase) {
    case 'uploading':
      return 'Uploading file…';
    case 'parsing':
      return p.totalPages
        ? `Parsing document — page ${p.page} of ${p.totalPages}`
        : 'Parsing document…';
    case 'analysing':
      return 'Creating tasks from parsed document…';
  }
}

type ExtractResponse = {
  pagesDone: number;
  totalPages: number;
  imagesFound: number;
  nextPage: number;
  done: boolean;
};

type AnalyseResponse = { tasks: ExtractedTask[] };

const FUNCTION_NAME = 'ExtractTasksAndImages';

/** Pages are never re-read, so a stalled cursor means the function is misbehaving. */
const MAX_CHUNKS = 200;

async function invoke<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(FUNCTION_NAME, { body });
  if (error) {
    console.error(`${FUNCTION_NAME} (${body.phase}) failed:`, error);
    throw error;
  }
  if (!data) throw new Error(`${FUNCTION_NAME} returned no data`);
  return data;
}

/**
 * Extracts a document's text and images, then derives tasks from it.
 *
 * The chunked extract loop is an implementation detail and stays hidden here; callers see
 * one awaited call plus progress updates.
 */
export async function extractTasksAndImages(
  description: string,
  filePath: string,
  options: { onProgress?: (p: ExtractProgress) => void } = {},
): Promise<ExtractedTask[]> {
  const { onProgress } = options;

  let fromPage = 1;
  let done = false;
  let images = 0;
  let chunks = 0;

  while (!done) {
    if (++chunks > MAX_CHUNKS) {
      throw new Error('Extraction did not finish — too many chunks');
    }

    const result = await invoke<ExtractResponse>({
      phase: 'extract',
      file_path: filePath,
      from_page: fromPage,
    });

    images += result.imagesFound;
    onProgress?.({
      phase: 'parsing',
      page: result.pagesDone,
      totalPages: result.totalPages,
      images,
    });

    // Guard against a cursor that fails to advance, which would otherwise spin forever.
    if (!result.done && result.nextPage <= fromPage) {
      throw new Error(`Extraction stalled at page ${fromPage}`);
    }

    fromPage = result.nextPage;
    done = result.done;
  }

  onProgress?.({ phase: 'analysing' });

  const { tasks } = await invoke<AnalyseResponse>({
    phase: 'analyse',
    file_path: filePath,
    description,
  });

  return tasks || [];
}
