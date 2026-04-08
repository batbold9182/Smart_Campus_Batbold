/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./styles/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "app-bg": "#f5f7fb",
        "app-surface": "#ffffff",
        "app-text": "#111827",
        "app-muted": "#4b5563",
        "app-border": "#d1d5db",
        // Grays & neutrals
        "app-border-light": "#e5e7eb",
        "app-bg-muted": "#f3f4f6",
        "app-bg-subtle": "#f9fafb",
        "app-placeholder": "#9ca3af",
        "app-text-secondary": "#374151",
        "app-text-subtle": "#64748b",
        // Primary blue
        "app-primary": "#2563eb",
        "app-primary-dark": "#1d4ed8",
        "app-primary-bg": "#eff6ff",
        "app-primary-light": "#dbeafe",
        "app-primary-muted": "#bfdbfe",
        "app-primary-loading": "#93c5fd",
        // Error / danger red
        "app-error": "#b91c1c",
        "app-danger": "#dc2626",
        "app-error-dark": "#991b1b",
        "app-error-bg": "#fee2e2",
        "app-error-bg-subtle": "#fef2f2",
        "app-error-light": "#fecaca",
        "app-error-loading": "#fca5a5",
        // Success green
        "app-success": "#047857",
        "app-success-dark": "#166534",
        "app-success-bg": "#d1fae5",
        "app-success-bg-subtle": "#ecfdf5",
        "app-success-light": "#dcfce7",
        "app-success-accent": "#16a34a",
        "app-success-timestamp": "#bbf7d0",
        // Warning amber
        "app-warning": "#b45309",
        "app-warning-dark": "#92400e",
        "app-warning-bg": "#fef3c7",
        // Disabled
        "app-disabled": "#cbd5e1",
        // Dark purple theme (student dashboard)
        "dark-bg": "#0d0221",
        "dark-surface": "#1a0a3e",
        "dark-card": "#231152",
        "dark-border": "#6b21a8",
        "dark-text": "#ffffff",
        "dark-muted": "#a78bfa",
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
