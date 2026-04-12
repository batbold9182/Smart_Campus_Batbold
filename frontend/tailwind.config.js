const { palette } = require("./styles/tokens");

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
        "app-bg": "var(--color-app-bg)",
        "app-surface": "var(--color-app-surface)",
        "app-bg-muted": "var(--color-app-bg-muted)",
        "app-bg-subtle": "var(--color-app-bg-subtle)",

        "app-text": "var(--color-app-text)",
        "app-muted": "var(--color-app-muted)",
        "app-text-secondary": "var(--color-app-text-secondary)",
        "app-text-subtle": "var(--color-app-text-subtle)",
        "app-placeholder": "var(--color-app-placeholder)",

        "app-border": "var(--color-app-border)",
        "app-border-light": "var(--color-app-border-light)",

        "app-primary-bg": "var(--color-app-primary-bg)",
        "app-primary-light": "var(--color-app-primary-light)",
        "app-primary-muted": "var(--color-app-primary-muted)",
        "app-primary-loading": "var(--color-app-primary-loading)",

        "app-error-bg": "var(--color-app-error-bg)",
        "app-error-bg-subtle": "var(--color-app-error-bg-subtle)",
        "app-error-light": "var(--color-app-error-light)",
        "app-error-loading": "var(--color-app-error-loading)",

        "app-success-bg": "var(--color-app-success-bg)",
        "app-success-bg-subtle": "var(--color-app-success-bg-subtle)",
        "app-success-light": "var(--color-app-success-light)",
        "app-success-timestamp": "var(--color-app-success-timestamp)",

        "app-warning-bg": "var(--color-app-warning-bg)",

        "app-disabled": "var(--color-app-disabled)",

        /* ── Static accent colours (same in light & dark) ── */
        "app-primary": palette.blue600,
        "app-primary-dark": palette.blue700,

        "app-error": palette.red700,
        "app-danger": palette.red600,
        "app-error-dark": palette.red800,

        "app-success": palette.green700,
        "app-success-dark": palette.green800,
        "app-success-accent": palette.green600,

        "app-warning": palette.amber700,
        "app-warning-dark": palette.amber800,

        /* ── Dark-theme palette (explicit, for StyleSheet-hybrid pages) ── */
        "dark-bg": palette.purple950,
        "dark-surface": palette.purple900,
        "dark-card": palette.purple800,
        "dark-border": palette.purple700,
        "dark-text": palette.white,
        "dark-muted": palette.purple400,
      },
      boxShadow: {
        "card-sm": "0 1px 3px rgba(15, 23, 42, 0.06)",
        card: "0 2px 6px rgba(15, 23, 42, 0.08)",
        "card-md": "0 4px 12px rgba(15, 23, 42, 0.10)",
        "card-lg": "0 8px 24px rgba(15, 23, 42, 0.12)",
      },
    },
  },
  plugins: [],
};
