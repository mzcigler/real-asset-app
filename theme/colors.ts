/**
 * App color palette — light and dark variants.
 *
 * All colors live here. To restyle the whole app, change values in this file.
 * Access via useTheme() hook: const { colors } = useTheme();
 */

export const lightColors = {
  // ── Backgrounds ──────────────────────────────────────────────────────────
  background: '#f3f4f6',
  surface: '#ffffff',
  surfaceSecondary: '#f9fafb',

  // ── Brand / Primary (teal) ────────────────────────────────────────────────
  primary: '#0f766e',
  primaryLight: '#f0fdf4',

  // ── Text ─────────────────────────────────────────────────────────────────
  textPrimary: '#111827',
  textSecondary: '#374151',
  textMuted: '#6b7280',
  textDisabled: '#9ca3af',
  textInverse: '#ffffff',

  // ── Borders & Dividers ────────────────────────────────────────────────────
  border: '#e5e7eb',
  borderLight: '#f3f4f6',

  // ── Action / Status Colors ────────────────────────────────────────────────
  /** Green — add, save, confirm */
  success: '#15803d',
  successLight: '#f0fdf4',
  /** Red — delete, destructive */
  danger: '#dc2626',
  dangerDisabled: '#fca5a5',
  /** Blue — upload, info, links */
  info: '#2563eb',
  /** Yellow — warnings */
  warning: '#f59e0b',

  // ── Task Urgency Indicators ───────────────────────────────────────────────
  urgencyPast: '#ef4444',    // overdue
  urgencyMonth: '#f59e0b',   // due within 30 days
  urgencyFuture: '#22c55e',  // more than 30 days away
  urgencyNone: '#d1d5db',    // no due date

  // ── Header ────────────────────────────────────────────────────────────────
  headerBg: '#ffffff',
  headerBorder: '#e5e7eb',

  // ── Scrollbar ────────────────────────────────────────────────────────────
  scrollTrack: '#d1d5db',
  scrollThumb: '#4b5563',

  // ── Property Card ────────────────────────────────────────────────────────
  propertyBackdrop: '#0f766e',

  // ── Inputs ────────────────────────────────────────────────────────────────
  inputBorder: '#d1d5db',
  inputBackground: '#ffffff',
  inputPlaceholder: '#9ca3af',

  // ── Overlay ───────────────────────────────────────────────────────────────
  overlay: 'rgba(0,0,0,0.4)',
};

export const darkColors: typeof lightColors = {
  // ── Backgrounds ──────────────────────────────────────────────────────────
  background: '#111827',
  surface: '#1f2937',
  surfaceSecondary: '#374151',

  // ── Brand / Primary ───────────────────────────────────────────────────────
  primary: '#14b8a6',
  primaryLight: '#042f2e',

  // ── Text ─────────────────────────────────────────────────────────────────
  textPrimary: '#f9fafb',
  textSecondary: '#e5e7eb',
  textMuted: '#9ca3af',
  textDisabled: '#6b7280',
  textInverse: '#111827',

  // ── Borders & Dividers ────────────────────────────────────────────────────
  border: '#374151',
  borderLight: '#1f2937',

  // ── Action / Status Colors ────────────────────────────────────────────────
  success: '#16a34a',
  successLight: '#052e16',
  danger: '#ef4444',
  dangerDisabled: '#7f1d1d',
  info: '#3b82f6',
  warning: '#f59e0b',

  // ── Task Urgency Indicators ───────────────────────────────────────────────
  urgencyPast: '#ef4444',
  urgencyMonth: '#f59e0b',
  urgencyFuture: '#22c55e',
  urgencyNone: '#6b7280',

  // ── Header ────────────────────────────────────────────────────────────────
  headerBg: '#1f2937',
  headerBorder: '#374151',

  // ── Scrollbar ────────────────────────────────────────────────────────────
  scrollTrack: '#374151',
  scrollThumb: '#9ca3af',

  // ── Property Card ────────────────────────────────────────────────────────
  propertyBackdrop: '#0f766e',

  // ── Inputs ────────────────────────────────────────────────────────────────
  inputBorder: '#4b5563',
  inputBackground: '#374151',
  inputPlaceholder: '#6b7280',

  // ── Overlay ───────────────────────────────────────────────────────────────
  overlay: 'rgba(0,0,0,0.6)',
};

export type Colors = typeof lightColors;
