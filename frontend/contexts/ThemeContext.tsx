import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { getTheme, type ThemeMode } from "../styles/theme";

type ThemeContextValue = {
  isDark: boolean;
  t: ThemeMode;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true);
  const toggleTheme = useCallback(() => setIsDark((prev) => !prev), []);
  const t = getTheme(isDark);

  return (
    <ThemeContext.Provider value={{ isDark, t, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
