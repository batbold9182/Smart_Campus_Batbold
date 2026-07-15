/**
 * tailwind.config.js
 *
 * Convention: tokens.js → global.css CSS variable → app-* Tailwind class
 *   - Mode-switching tokens: use "var(--color-app-xxx)" so light/dark CSS vars apply
 *   - Static accents (same in both modes): use the palette value directly
 *
 * Do NOT add raw hex literals here — trace every value back to tokens.js.
 */

const { palette, type, radius } = require("./styles/tokens");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./styles/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        /* ── Mode-switching tokens (CSS variables from global.css) ── */
        "app-bg":          "var(--color-app-bg)",
        "app-surface":     "var(--color-app-surface)",
        "app-bg-muted":    "var(--color-app-bg-muted)",
        "app-bg-subtle":   "var(--color-app-bg-subtle)",

        "app-text":           "var(--color-app-text)",
        "app-muted":          "var(--color-app-muted)",
        "app-text-secondary": "var(--color-app-text-secondary)",
        "app-text-subtle":    "var(--color-app-text-subtle)",
        "app-placeholder":    "var(--color-app-placeholder)",

        "app-border":       "var(--color-app-border)",
        "app-border-light": "var(--color-app-border-light)",

        "app-primary-bg":      "var(--color-app-primary-bg)",
        "app-primary-light":   "var(--color-app-primary-light)",
        "app-primary-muted":   "var(--color-app-primary-muted)",
        "app-primary-loading": "var(--color-app-primary-loading)",

        "app-error-bg":        "var(--color-app-error-bg)",
        "app-error-bg-subtle": "var(--color-app-error-bg-subtle)",
        "app-error-light":     "var(--color-app-error-light)",
        "app-error-loading":   "var(--color-app-error-loading)",

        "app-success-bg":        "var(--color-app-success-bg)",
        "app-success-bg-subtle": "var(--color-app-success-bg-subtle)",
        "app-success-light":     "var(--color-app-success-light)",
        "app-success-timestamp": "var(--color-app-success-timestamp)",

        "app-warning-bg": "var(--color-app-warning-bg)",

        "app-disabled": "var(--color-app-disabled)",

        /* Input state tokens */
        "app-input-border":       "var(--color-app-input-border)",
        "app-input-border-focus": "var(--color-app-input-border-focus)",

        /* Skeleton */
        "app-skeleton": "var(--color-app-skeleton)",

        /* Divider */
        "app-divider": "var(--color-app-divider)",

        /* Glassmorphism */
        "app-glass-light":   "var(--color-app-glass-light)",
        "app-glass-border":  "var(--color-app-glass-border)",
        "app-glass-overlay": "var(--color-app-glass-overlay)",

        /* ── Static accent colours (same in light & dark) ── */
        "app-primary":      palette.teal600,
        "app-primary-dark": palette.teal700,

        "app-error":      palette.red700,
        "app-danger":     palette.red600,
        "app-error-dark": palette.red800,

        "app-success":        palette.green700,
        "app-success-dark":   palette.green800,
        "app-success-accent": palette.green600,

        "app-warning":      palette.amber700,
        "app-warning-dark": palette.amber800,

        "app-online":       palette.green500,    // status dot
        "app-warning-icon": palette.yellow400,   // warning / bell icons
        "app-overlay-light": "rgba(255,255,255,0.2)", // button bg on gradients

        /* ── Dark-theme palette (explicit, for StyleSheet-hybrid pages) ── */
        "dark-bg":      palette.teal950,
        "dark-surface": palette.teal900,
        "dark-card":    palette.teal800,
        "dark-border":  palette.teal800,
        "dark-text":    palette.white,
        "dark-muted":   palette.teal300,
      },

      /* ── Typography scale ── */
      fontSize: {
        "app-xs":  [type.xs.size + "px",   { lineHeight: type.xs.leading   + "px" }],
        "app-sm":  [type.sm.size + "px",   { lineHeight: type.sm.leading   + "px" }],
        "app-base":[type.base.size + "px", { lineHeight: type.base.leading + "px" }],
        "app-md":  [type.md.size + "px",   { lineHeight: type.md.leading   + "px" }],
        "app-lg":  [type.lg.size + "px",   { lineHeight: type.lg.leading   + "px" }],
        "app-xl":  [type.xl.size + "px",   { lineHeight: type.xl.leading   + "px" }],
        "app-2xl": [type["2xl"].size + "px",{ lineHeight: type["2xl"].leading + "px" }],
      },

      /* ── Border radius scale ── */
      borderRadius: {
        "app-sm":   radius.sm   + "px",
        "app-md":   radius.md   + "px",
        "app-lg":   radius.lg   + "px",
        "app-xl":   radius.xl   + "px",
        "app-full": radius.full + "px",
      },

      /* ── Box shadow scale ── */
      boxShadow: {
        "card-sm": "0 1px 3px rgba(15, 23, 42, 0.06)",
        "card":    "0 2px 6px rgba(15, 23, 42, 0.08)",
        "card-md": "0 4px 12px rgba(15, 23, 42, 0.10)",
        "card-lg": "0 8px 24px rgba(15, 23, 42, 0.12)",
      },
    },
  },
  plugins: [],
};
