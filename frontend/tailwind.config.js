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
        "app-muted": "#6b7280",
        "app-border": "#d1d5db",
      },
      boxShadow: {
        card: "0 2px 6px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};
