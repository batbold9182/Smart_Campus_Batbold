import { base, dark, light } from "./tokens";

export const theme = { colors: base, dark, light } as const;

export type ThemeMode = typeof theme.dark | typeof theme.light;

export const getTheme = (isDark: boolean) =>
  isDark ? theme.dark : theme.light;
