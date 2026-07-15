import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTheme, type ThemeMode } from "../styles/theme";
import { haptic } from "../utils/haptics";

type ThemeContextValue = {
  isDark: boolean;
  t: ThemeMode;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_KEY = "app_theme_pref"; // "dark" | "light"

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  // Hydrate once: use the saved preference, else fall back to the OS scheme,
  // else keep the dark default.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_KEY);
        if (!active) return;
        if (stored === "dark" || stored === "light") {
          setIsDark(stored === "dark");
        } else {
          const scheme = Appearance.getColorScheme();
          if (scheme) setIsDark(scheme === "dark");
        }
      } catch {
        // keep the current default on any storage failure
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const toggleTheme = useCallback(() => {
    haptic.selection();
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(THEME_KEY, next ? "dark" : "light").catch(() => {});
      return next;
    });
  }, []);

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
