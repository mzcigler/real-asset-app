/**
 * App color palette — light and dark variants.
 *
 * All colors live here. To restyle the whole app, change values in this file.
 * Access via useTheme() hook: const { colors } = useTheme();
 *
 * Palette matches real-asset-app-concept-design: warm cream surfaces,
 * deep petrol-blue primary, amber accent, red reserved for destructive.
 */

export const lightColors = {
  // ── Backgrounds ──────────────────────────────────────────────────────────
  background: '#f5f2f0',
  surface: '#fbfaf9',
  surfaceSecondary: '#e9e6e2',

  // ── Brand / Primary (deep petrol blue) ───────────────────────────────────
  primary: '#13435e',
  primaryLight: '#dae9f1',

  // ── Text ─────────────────────────────────────────────────────────────────
  textPrimary: '#13435e',
  textSecondary: '#243842',
  textMuted: '#8c7b73',
  textDisabled: '#afa39d',
  textInverse: '#f5f2f0',

  // ── Borders & Dividers ────────────────────────────────────────────────────
  border: '#ded9d3',
  borderLight: '#e9e6e2',

  // ── Action / Status Colors ────────────────────────────────────────────────
  /** Sage green — add, save, confirm */
  success: '#3a7360',
  successLight: '#e8f2ef',
  /** Red — delete, destructive */
  danger: '#dc2828',
  dangerDisabled: '#efb3b3',
  /** Steel blue — upload, info, links */
  info: '#477585',
  infoLight: '#e3eef2',
  /** Amber — warnings, highlights */
  warning: '#f59e0b',

  // ── Task Urgency Indicators ───────────────────────────────────────────────
  urgencyPast: '#dc2828',    // overdue
  urgencyMonth: '#f59e0b',   // due within 30 days
  urgencyFuture: '#50957e',  // more than 30 days away
  urgencyNone: '#d6cfc7',    // no due date

  // ── Header / Sidebar (dark petrol nav, like the concept sidebar) ─────────
  headerBg: '#173945',
  headerBorder: '#2e5460',
  headerText: '#efebe7',
  headerTextMuted: '#afbcc0',
  headerActiveBg: '#264d59',
  /** Warm tan accent for logo + active nav item (concept --sidebar-primary) */
  headerAccent: '#e4d9cd',

  // ── Scrollbar ────────────────────────────────────────────────────────────
  scrollTrack: '#ded9d3',
  scrollThumb: '#8c7b73',

  // ── Property Card ────────────────────────────────────────────────────────
  propertyBackdrop: '#173945',

  // ── Inputs ────────────────────────────────────────────────────────────────
  inputBorder: '#ded9d3',
  inputBackground: '#fbfaf9',
  inputPlaceholder: '#afa39d',

  // ── Overlay ───────────────────────────────────────────────────────────────
  overlay: 'rgba(19, 42, 54, 0.45)',
};

export const darkColors: typeof lightColors = {
  // ── Backgrounds ──────────────────────────────────────────────────────────
  background: '#131c20',
  surface: '#192429',
  surfaceSecondary: '#253137',

  // ── Brand / Primary ───────────────────────────────────────────────────────
  primary: '#59a6c0',
  primaryLight: '#1b2e37',

  // ── Text ─────────────────────────────────────────────────────────────────
  textPrimary: '#efebe7',
  textSecondary: '#e7e0da',
  textMuted: '#988c81',
  textDisabled: '#6e665e',
  textInverse: '#131c20',

  // ── Borders & Dividers ────────────────────────────────────────────────────
  border: '#29363d',
  borderLight: '#192429',

  // ── Action / Status Colors ────────────────────────────────────────────────
  success: '#498d76',
  successLight: '#1f332c',
  danger: '#a52727',
  dangerDisabled: '#5c1f1f',
  info: '#3d7a8f',
  infoLight: '#1e3238',
  warning: '#f59e0b',

  // ── Task Urgency Indicators ───────────────────────────────────────────────
  urgencyPast: '#dc2828',
  urgencyMonth: '#f59e0b',
  urgencyFuture: '#59a68c',
  urgencyNone: '#49545a',

  // ── Header / Sidebar (dark petrol nav, like the concept sidebar) ─────────
  headerBg: '#0e161b',
  headerBorder: '#223239',
  headerText: '#efebe7',
  headerTextMuted: '#8f9ca3',
  headerActiveBg: '#1d2930',
  headerAccent: '#59a6c0',

  // ── Scrollbar ────────────────────────────────────────────────────────────
  scrollTrack: '#29363d',
  scrollThumb: '#988c81',

  // ── Property Card ────────────────────────────────────────────────────────
  propertyBackdrop: '#173945',

  // ── Inputs ────────────────────────────────────────────────────────────────
  inputBorder: '#29363d',
  inputBackground: '#253137',
  inputPlaceholder: '#6e665e',

  // ── Overlay ───────────────────────────────────────────────────────────────
  overlay: 'rgba(0, 0, 0, 0.6)',
};

export type Colors = typeof lightColors;
