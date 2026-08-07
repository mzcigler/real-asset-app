import { extractTasksAndImages, progressMessage, type ExtractProgress } from '@/services/extractionService';
import { uploadPropertyFile } from '@/services/fileService';
import { TaskType } from '@/types';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';

/**
 * Runs document extraction at app level rather than inside the upload dialog.
 *
 * A 76-page report takes ~20s across a dozen requests. Holding a modal open for that long
 * makes the app feel broken and blocks work the user could be doing meanwhile, so the job
 * is started here and the dialog closes immediately; progress surfaces in a small bar and
 * the confirmation popup opens when the user chooses to review.
 */

export type ExtractionStatus = 'uploading' | 'parsing' | 'analysing' | 'ready' | 'error';

export type ExtractionJob = {
  id: string;
  fileName: string;
  userId: string;
  propertyId: string;
  /** Set once the upload has produced a files row. */
  fileId?: string;
  status: ExtractionStatus;
  /** Human-readable line for the status bar. */
  message: string;
  page: number;
  totalPages: number | null;
  images: number;
  tasks: TaskType[];
  error?: string;
};

export type StartExtractionInput = {
  userId: string;
  propertyId: string;
  fileUri: string;
  fileName: string;
  description: string;
};

/** Statuses where work is still in flight and closing the app would lose it. */
export const isJobActive = (job: ExtractionJob) =>
  job.status === 'uploading' || job.status === 'parsing' || job.status === 'analysing';

/**
 * True when closing the app would lose something the user cannot cheaply recover.
 *
 * That covers a finished job as well as a running one: extracted tasks live only in
 * memory until they are confirmed, and reproducing them means paying for another model
 * call over the whole document.
 */
export const isJobUnsaved = (job: ExtractionJob) =>
  isJobActive(job) || (job.status === 'ready' && job.tasks.length > 0);

type ExtractionContextValue = {
  jobs: ExtractionJob[];
  /** True while any document is still being processed. */
  hasActiveJobs: boolean;
  /** Fire-and-forget. Returns the job id so a caller can follow it if it wants to. */
  startExtraction: (input: StartExtractionInput) => string;
  /** The job whose tasks are currently being reviewed, if any. */
  reviewingJob: ExtractionJob | null;
  reviewJob: (id: string) => void;
  closeReview: () => void;
  dismissJob: (id: string) => void;
  /**
   * Timestamps screens can depend on to refetch. Needed because the work no longer
   * finishes while the dialog that started it is open — by the time a document lands in
   * storage or its tasks are saved, the user may be on an entirely different screen.
   */
  filesChangedAt: number;
  tasksSavedAt: number;
  markTasksSaved: () => void;
};

const ExtractionContext = createContext<ExtractionContextValue>({
  jobs: [],
  hasActiveJobs: false,
  startExtraction: () => '',
  reviewingJob: null,
  reviewJob: () => {},
  closeReview: () => {},
  dismissJob: () => {},
  filesChangedAt: 0,
  tasksSavedAt: 0,
  markTasksSaved: () => {},
});

export function ExtractionProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<ExtractionJob[]>([]);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [tasksSavedAt, setTasksSavedAt] = useState(0);
  const [filesChangedAt, setFilesChangedAt] = useState(0);
  const nextId = useRef(0);

  const patch = useCallback((id: string, changes: Partial<ExtractionJob>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...changes } : j)));
  }, []);

  const startExtraction = useCallback(
    ({ userId, propertyId, fileUri, fileName, description }: StartExtractionInput) => {
      const id = `job-${++nextId.current}`;

      setJobs((prev) => [
        ...prev,
        {
          id,
          fileName,
          userId,
          propertyId,
          status: 'uploading',
          message: progressMessage({ phase: 'uploading' }),
          page: 0,
          totalPages: null,
          images: 0,
          tasks: [],
        },
      ]);

      // Deliberately not awaited: the caller returns immediately and the work continues
      // against the provider, which outlives whatever screen started it.
      void (async () => {
        try {
          const { id: fileId, filePath } = await uploadPropertyFile(
            userId,
            propertyId,
            fileUri,
            fileName,
          );
          patch(id, { fileId });
          // The document exists now, so any screen listing files can pick it up even
          // though extraction has barely started.
          setFilesChangedAt(Date.now());

          const onProgress = (p: ExtractProgress) => {
            patch(id, {
              status: p.phase === 'analysing' ? 'analysing' : 'parsing',
              message: progressMessage(p),
              page: p.phase === 'parsing' ? p.page : 0,
              totalPages: p.phase === 'parsing' ? p.totalPages : null,
              images: p.phase === 'parsing' ? p.images : 0,
            });
          };

          const raw = await extractTasksAndImages(description, filePath, { onProgress });

          const tasks: TaskType[] = raw.map((task) => ({
            title: task.title,
            dueDate: parseIsoDate(task.dueDate),
            severity: task.severity,
            severityLabel: task.severityLabel,
            moreInfo: task.moreInfo,
            imageRefs: task.imageRefs,
          }));

          patch(id, {
            status: 'ready',
            tasks,
            message: tasks.length
              ? `${tasks.length} task${tasks.length === 1 ? '' : 's'} found in ${fileName}`
              : `No tasks found in ${fileName}`,
          });
        } catch (err) {
          patch(id, {
            status: 'error',
            error: err instanceof Error ? err.message : String(err),
            message: `Could not process ${fileName}`,
          });
        }
      })();

      return id;
    },
    [patch],
  );

  const dismissJob = useCallback((id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
    setReviewingId((current) => (current === id ? null : current));
  }, []);

  const hasActiveJobs = jobs.some(isJobActive);
  const hasUnsavedWork = jobs.some(isJobUnsaved);

  /**
   * Guard the browser tab while work is in flight.
   *
   * The chunk loop lives in this JS context, so closing the tab abandons it: the pages
   * already extracted stay in storage, but nothing drives the run to completion and no
   * tasks are ever produced. Extracted-but-unconfirmed tasks are just as perishable, and
   * cost a model call to reproduce. On web the browser can ask before either is lost; on
   * native there is no equivalent hook, which is why the status bar says so in words.
   */
  useEffect(() => {
    if (Platform.OS !== 'web' || !hasUnsavedWork) return;
    if (typeof window === 'undefined') return;

    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Browsers show their own wording; a non-empty returnValue is what triggers it.
      event.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [hasUnsavedWork]);

  const value = useMemo<ExtractionContextValue>(
    () => ({
      jobs,
      hasActiveJobs,
      startExtraction,
      reviewingJob: jobs.find((j) => j.id === reviewingId) ?? null,
      reviewJob: setReviewingId,
      closeReview: () => setReviewingId(null),
      dismissJob,
      filesChangedAt,
      tasksSavedAt,
      markTasksSaved: () => setTasksSavedAt(Date.now()),
    }),
    [jobs, hasActiveJobs, reviewingId, startExtraction, dismissJob, filesChangedAt, tasksSavedAt],
  );

  return <ExtractionContext.Provider value={value}>{children}</ExtractionContext.Provider>;
}

/** Access extraction jobs and start new ones from anywhere in the app. */
export function useExtraction() {
  return useContext(ExtractionContext);
}

/** Dates arrive as YYYY-MM-DD and must become local midnight, not UTC midnight. */
function parseIsoDate(value: string | null): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return isNaN(date.getTime()) ? null : date;
}
