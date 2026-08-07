import { Colors } from '@/theme/colors';
import { SEVERITIES, Severity } from '@/types';

/** Options for the severity dropdown. Clearing the dropdown yields null. */
export const SEVERITY_OPTIONS: { label: string; value: Severity }[] = [
  { label: 'Critical',      value: 'critical' },
  { label: 'High',          value: 'high' },
  { label: 'Medium',        value: 'medium' },
  { label: 'Low',           value: 'low' },
  { label: 'Informational', value: 'informational' },
];

export const SEVERITY_LABELS: Record<Severity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  informational: 'Informational',
};

export const isSeverity = (value: unknown): value is Severity =>
  typeof value === 'string' && (SEVERITIES as readonly string[]).includes(value);

/**
 * Colour for a severity chip.
 *
 * Semantic, and separate from the app's accent: severity has to read as state at a glance
 * in a long task list, not as decoration.
 */
export function severityColor(severity: Severity, colors: Colors): string {
  switch (severity) {
    case 'critical':
      return colors.danger;
    case 'high':
      return colors.warning;
    case 'medium':
      return colors.info;
    case 'low':
      return colors.success;
    case 'informational':
    default:
      return colors.textMuted;
  }
}
