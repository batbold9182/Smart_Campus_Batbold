export const theme = {
  colors: {
    appBg: "#f5f7fb",
    surface: "#ffffff",
    text: "#111827",
    muted: "#4b5563",
    border: "#d1d5db",
    primary: "#2563eb",
    danger: "#b91c1c",
    fieldError: "#B00020",
  },
  dark: {
    bg: "#0d0221",
    surface: "#1a0a3e",
    cardBorder: "#6b21a8",
    text: "#ffffff",
    muted: "#a78bfa",
    scheduleLink: "#818cf8",
    prof: "#c4b5fd",
    schedDivider: "#6b21a8",
    avatarBg: "#231152",
    greenBorderBg: "#0d0221",
    accentBar: "#a855f7",
  },
  light: {
    bg: "#f5f7fb",
    surface: "#ffffff",
    cardBorder: "#d1d5db",
    text: "#111827",
    muted: "#4b5563",
    scheduleLink: "#2563eb",
    prof: "#374151",
    schedDivider: "#e5e7eb",
    avatarBg: "#e5e7eb",
    greenBorderBg: "#f5f7fb",
    accentBar: "#7c3aed",
  },
} as const;

export type ThemeMode = typeof theme.dark | typeof theme.light;

export const getTheme = (isDark: boolean) =>
  isDark ? theme.dark : theme.light;
