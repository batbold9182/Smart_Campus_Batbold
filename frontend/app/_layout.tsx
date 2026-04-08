import { Stack } from "expo-router";
import "../global.css";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";

function InnerLayout() {
  const { isDark, t } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} translucent={false} backgroundColor={t.bg} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <InnerLayout />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
