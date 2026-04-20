/**
 * tokens.js — Single source of truth for every colour in the app.
 *
 * Consumed by:
 *   • tailwind.config.js  (require)
 *   • styles/theme.ts     (require → typed re-export)
 *
 * Rule: every hex literal in the project should trace back here.
 * Convention: tokens.js → global.css → tailwind.config.js → component.
 */

/* ------------------------------------------------------------------ */
/*  Raw palette – each hex value appears exactly once                  */
/* ------------------------------------------------------------------ */
const palette = {
  // White / Black
  white: "#ffffff",
  black: "#000000",

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
  grayNeutral: "#6b7280", // muted badge / neutral status
  slate200: "#e2e8f0",    // skeleton light mode
  slate300: "#cbd5e1",
  appBg: "#f5f7fb",       // light-mode page background

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
  red500: "#ef4444",      // danger badge / vivid error
  red600: "#dc2626",
  red700: "#b91c1c",
  red800: "#991b1b",
  fieldError: "#B00020",

  // Green (success)
  green50: "#ecfdf5",
  green100: "#d1fae5",
  green200: "#dcfce7",
  green300: "#bbf7d0",
  green500: "#22c55e",    // online indicator / active green
  green600: "#16a34a",
  green700: "#047857",
  green800: "#166534",

  // Amber (warning)
  amber100: "#fef3c7",
  amber700: "#b45309",
  amber800: "#92400e",

  // Yellow (icon accent)
  yellow400: "#facc15",   // warning icon / notification bell

  // Purple / Indigo (dark theme)
  purple50: "#faf5ff",    // subtle card tint light
  purple950: "#0d0221",
  purple900: "#1a0a3e",
  purple800: "#231152",
  purple700: "#6b21a8",
  purple600: "#7c3aed",
  purple500: "#a855f7",
  purple400: "#a78bfa",
  purple300: "#c4b5fd",
  indigo400: "#818cf8",

  // Magenta (brand gradient mid)
  magenta600: "#a21caf",
  pink600:    "#db2777",
  rose600:    "#e11d48",
};

/* ------------------------------------------------------------------ */
/*  Semantic tokens for ThemeContext  (StyleSheet pages)               */
/*  Keys must stay identical — they are referenced as  t.<key>        */
/* ------------------------------------------------------------------ */
const light = {
  // Backgrounds
  bg:            palette.appBg,
  surface:       palette.white,
  cardBorder:    palette.gray300,

  // Text
  text:          palette.gray900,
  muted:         palette.gray600,

  // Schedule-specific
  scheduleLink:  palette.blue600,
  prof:          palette.gray700,
  schedDivider:  palette.gray200,
  avatarBg:      palette.gray200,
  greenBorderBg: palette.appBg,
  accentBar:     palette.purple600,

  // New semantic tokens
  online:           palette.green500,      // status dot
  divider:          palette.gray200,       // separator lines
  inputBorder:      palette.gray300,       // input default border
  inputBorderFocus: palette.blue600,       // input focused border
  skeleton:         palette.slate200,      // skeleton loading bg
  shadow:           "#0f172a",             // StyleSheet shadowColor
  error:            palette.red600,        // error text / borders
  warningIcon:      palette.yellow400,     // warning / notification icons

  // Glassmorphism
  glassLight:   "rgba(255,255,255,0.75)",  // glass card background
  glassBorder:  "rgba(255,255,255,0.85)",  // glass card border
  glassOverlay: "rgba(0,0,0,0.4)",         // modal backdrop
  overlayLight: "rgba(255,255,255,0.2)",   // button bg on gradient
};

const dark = {
  // Backgrounds
  bg:            palette.purple950,
  surface:       palette.purple900,
  cardBorder:    palette.purple700,

  // Text
  text:          palette.white,
  muted:         palette.purple400,

  // Schedule-specific
  scheduleLink:  palette.indigo400,
  prof:          palette.purple300,
  schedDivider:  palette.purple700,
  avatarBg:      palette.purple800,
  greenBorderBg: palette.purple950,
  accentBar:     palette.purple500,

  // New semantic tokens
  online:           palette.green500,
  divider:          palette.purple700,
  inputBorder:      palette.purple700,
  inputBorderFocus: palette.indigo400,
  skeleton:         palette.purple800,
  shadow:           palette.purple950,
  error:            palette.red500,
  warningIcon:      palette.yellow400,

  // Glassmorphism
  glassLight:   "rgba(255,255,255,0.05)",
  glassBorder:  "rgba(255,255,255,0.12)",
  glassOverlay: "rgba(0,0,0,0.6)",
  overlayLight: "rgba(255,255,255,0.2)",
};

/** Base colours previously in theme.colors (used by a few StyleSheet pages) */
const base = {
  appBg:      palette.appBg,
  surface:    palette.white,
  text:       palette.gray900,
  muted:      palette.gray600,
  border:     palette.gray300,
  primary:    palette.blue600,
  danger:     palette.red700,
  fieldError: palette.fieldError,
};

/* ------------------------------------------------------------------ */
/*  Typography scale                                                   */
/*  Exposed in tailwind.config.js as text-app-xs … text-app-2xl       */
/* ------------------------------------------------------------------ */
const type = {
  xs:   { size: 11, leading: 16 }, // captions, timestamps
  sm:   { size: 13, leading: 20 }, // labels, helper text
  base: { size: 15, leading: 24 }, // body
  md:   { size: 17, leading: 26 }, // subheadings
  lg:   { size: 20, leading: 30 }, // section titles
  xl:   { size: 24, leading: 34 }, // screen titles
  "2xl":{ size: 30, leading: 40 }, // hero numbers
};

/* ------------------------------------------------------------------ */
/*  Radius scale                                                       */
/*  Exposed in tailwind.config.js as rounded-app-sm … rounded-app-xl  */
/* ------------------------------------------------------------------ */
const radius = {
  sm:   8,    // tags, badges
  md:   12,   // inputs, secondary cards
  lg:   16,   // primary cards, sheets
  xl:   24,   // modals, hero cards
  full: 9999, // pills, avatars
};

/* ------------------------------------------------------------------ */
/*  Spacing scale  (px values — for StyleSheet use)                   */
/* ------------------------------------------------------------------ */
const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
};

/* ------------------------------------------------------------------ */
/*  Gradient tokens  (used in LinearGradient components)              */
/*  All values reference palette.* — no raw hex literals here.        */
/* ------------------------------------------------------------------ */
const gradients = {
  brand:       [palette.purple700, palette.magenta600, palette.pink600], // dashboard header
  primary:     [palette.blue600,   palette.purple600],                   // screen headers light
  primaryDark: [palette.purple700, palette.purple500],                   // screen headers dark
  danger:      [palette.rose600,   palette.pink600],                     // logout / destructive
  card:        [palette.blue50,    palette.purple50],                    // subtle card tint
};

/* ------------------------------------------------------------------ */
/*  Motion tokens  (ms durations for Animated / Reanimated)           */
/* ------------------------------------------------------------------ */
const motion = {
  fast:   150,
  normal: 250,
  slow:   400,
  slower: 600,
};

/* ------------------------------------------------------------------ */
/*  Tailwind colour map  (ready to spread into theme.extend.colors)   */
/*  Note: mode-switching tokens use CSS variables in global.css        */
/*  This map is kept for reference / non-Tailwind JS consumers.       */
/* ------------------------------------------------------------------ */
const tailwind = {
  // Core (mode-switching — actual values vary via CSS vars)
  "app-bg":      palette.appBg,
  "app-surface": palette.white,
  "app-text":    palette.gray900,
  "app-muted":   palette.gray600,
  "app-border":  palette.gray300,

  // Grays & neutrals
  "app-border-light":    palette.gray200,
  "app-bg-muted":        palette.gray100,
  "app-bg-subtle":       palette.gray50,
  "app-placeholder":     palette.gray400,
  "app-text-secondary":  palette.gray700,
  "app-text-subtle":     palette.gray500,

  // Primary blue (static accent)
  "app-primary":         palette.blue600,
  "app-primary-dark":    palette.blue700,
  "app-primary-bg":      palette.blue50,
  "app-primary-light":   palette.blue100,
  "app-primary-muted":   palette.blue200,
  "app-primary-loading": palette.blue300,

  // Error / danger red (static accent)
  "app-error":           palette.red700,
  "app-danger":          palette.red600,
  "app-error-dark":      palette.red800,
  "app-error-bg":        palette.red100,
  "app-error-bg-subtle": palette.red50,
  "app-error-light":     palette.red200,
  "app-error-loading":   palette.red300,

  // Success green (static accent)
  "app-success":            palette.green700,
  "app-success-dark":       palette.green800,
  "app-success-bg":         palette.green100,
  "app-success-bg-subtle":  palette.green50,
  "app-success-light":      palette.green200,
  "app-success-accent":     palette.green600,
  "app-success-timestamp":  palette.green300,

  // Warning amber (static accent)
  "app-warning":      palette.amber700,
  "app-warning-dark": palette.amber800,
  "app-warning-bg":   palette.amber100,

  // Disabled
  "app-disabled": palette.slate300,

  // Static accents (same in both modes)
  "app-online":       palette.green500,    // online status dot
  "app-warning-icon": palette.yellow400,   // warning / bell icons

  // Dark purple theme
  "dark-bg":      palette.purple950,
  "dark-surface": palette.purple900,
  "dark-card":    palette.purple800,
  "dark-border":  palette.purple700,
  "dark-text":    palette.white,
  "dark-muted":   palette.purple400,
};

module.exports = { palette, light, dark, base, type, radius, space, gradients, motion, tailwind };
