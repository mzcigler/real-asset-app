import { RecurAnchor, RecurFrequency } from '@/types';

export const FREQ_OPTIONS: { label: string; value: RecurFrequency }[] = [
  { label: 'Daily',   value: 'daily'   },
  { label: 'Weekly',  value: 'weekly'  },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly',  value: 'yearly'  },
];

export const ANCHOR_OPTIONS: { label: string; value: RecurAnchor }[] = [
  { label: 'From due date',   value: 'due_date'   },
  { label: 'From completion', value: 'completion' },
];

export const FREQ_LABELS: Record<RecurFrequency, string> = {
  daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly',
};
