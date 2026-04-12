/**
 * tokens.js — Single source of truth for every colour in the app.
 *
 * Consumed by:
 *   • tailwind.config.js  (require)
 *   • styles/theme.ts     (require → typed re-export)
 *
 * Rule: every hex literal in the project should trace back here.
 */

/* ------------------------------------------------------------------ */
/*  Raw palette – each hex value appears exactly once                  */
/* ------------------------------------------------------------------ */
const palette = {
  // White / Black
  white: "#ffffff",

  // Grays  (Tailwind-ish naming)
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#64748b",
  gray600: "#4b5563",
  gray700: "#374151",
  gray900: "#111827",
  slate300: "#cbd5e1",
  appBg: "#f5f7fb", // light-mode page background

  // Blue (primary)
  blue50: "#eff6ff",
  blue100: "#dbeafe",
  blue200: "#bfdbfe",
  blue300: "#93c5fd",
  blue600: "#2563eb",
  blue700: "#1d4ed8",

  // Red (error / danger)
  red50: "#fef2f2",
  red100: "#fee2e2",
  red200: "#fecaca",
  red300: "#fca5a5",
  red600: "#dc2626",
  red700: "#b91c1c",
  red800: "#991b1b",
  fieldError: "#B00020",

  // Green (success)
  green50: "#ecfdf5",
  green100: "#d1fae5",
  green200: "#dcfce7",
  green300: "#bbf7d0",
  green600: "#16a34a",
  green700: "#047857",
  green800: "#166534",

  // Amber (warning)
  amber100: "#fef3c7",
  amber700: "#b45309",
  amber800: "#92400e",

  // Purple / Indigo (dark theme)
  purple950: "#0d0221",
  purple900: "#1a0a3e",
  purple800: "#231152",
  purple700: "#6b21a8",
  purple600: "#7c3aed",
  purple500: "#a855f7",
  purple400: "#a78bfa",
  purple300: "#c4b5fd",
  indigo400: "#818cf8",
};

/* ------------------------------------------------------------------ */
/*  Semantic tokens for ThemeContext  (StyleSheet pages)               */
/*  Keys must stay identical — they are referenced as  t.<key>        */
/* ------------------------------------------------------------------ */
const light = {
  bg: palette.appBg,
  surface: palette.white,
  cardBorder: palette.gray300,
  text: palette.gray900,
  muted: palette.gray600,
  scheduleLink: palette.blue600,
  prof: palette.gray700,
  schedDivider: palette.gray200,
  avatarBg: palette.gray200,
  greenBorderBg: palette.appBg,
  accentBar: palette.purple600,
};

const dark = {
  bg: palette.purple950,
  surface: palette.purple900,
  cardBorder: palette.purple700,
  text: palette.white,
  muted: palette.purple400,
  scheduleLink: palette.indigo400,
  prof: palette.purple300,
  schedDivider: palette.purple700,
  avatarBg: palette.purple800,
  greenBorderBg: palette.purple950,
  accentBar: palette.purple500,
};

/** Base colours previously in theme.colors (used by a few StyleSheet pages) */
const base = {
  appBg: palette.appBg,
  surface: palette.white,
  text: palette.gray900,
  muted: palette.gray600,
  border: palette.gray300,
  primary: palette.blue600,
  danger: palette.red700,
  fieldError: palette.fieldError,
};

/* ------------------------------------------------------------------ */
/*  Tailwind colour map  (ready to spread into theme.extend.colors)   */
/*  Note: mode-switching tokens now use CSS variables in global.css    */
/*  This map is kept for reference / non-Tailwind JS consumers.       */
/* ------------------------------------------------------------------ */
const tailwind = {
  // Core (mode-switching — actual values vary via CSS vars)
  "app-bg": palette.appBg,
  "app-surface": palette.white,
  "app-text": palette.gray900,
  "app-muted": palette.gray600,
  "app-border": palette.gray300,

  // Grays & neutrals
  "app-border-light": palette.gray200,
  "app-bg-muted": palette.gray100,
  "app-bg-subtle": palette.gray50,
  "app-placeholder": palette.gray400,
  "app-text-secondary": palette.gray700,
  "app-text-subtle": palette.gray500,

  // Primary blue (static accent)
  "app-primary": palette.blue600,
  "app-primary-dark": palette.blue700,
  "app-primary-bg": palette.blue50,
  "app-primary-light": palette.blue100,
  "app-primary-muted": palette.blue200,
  "app-primary-loading": palette.blue300,

  // Error / danger red (static accent)
  "app-error": palette.red700,
  "app-danger": palette.red600,
  "app-error-dark": palette.red800,
  "app-error-bg": palette.red100,
  "app-error-bg-subtle": palette.red50,
  "app-error-light": palette.red200,
  "app-error-loading": palette.red300,

  // Success green (static accent)
  "app-success": palette.green700,
  "app-success-dark": palette.green800,
  "app-success-bg": palette.green100,
  "app-success-bg-subtle": palette.green50,
  "app-success-light": palette.green200,
  "app-success-accent": palette.green600,
  "app-success-timestamp": palette.green300,

  // Warning amber (static accent)
  "app-warning": palette.amber700,
  "app-warning-dark": palette.amber800,
  "app-warning-bg": palette.amber100,

  // Disabled
  "app-disabled": palette.slate300,

  // Dark purple theme
  "dark-bg": palette.purple950,
  "dark-surface": palette.purple900,
  "dark-card": palette.purple800,
  "dark-border": palette.purple700,
  "dark-text": palette.white,
  "dark-muted": palette.purple400,
};

module.exports = { palette, light, dark, base, tailwind };
