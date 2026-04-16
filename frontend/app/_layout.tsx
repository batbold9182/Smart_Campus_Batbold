import { Stack } from "expo-router";
import "../global.css";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";
import { AuthProvider } from "../contexts/AuthContext";
import { ThemeTransitionOverlay } from "../components/ThemeTransitionOverlay";
import { ErrorBoundary } from "../components/ErrorBoundary";

function InnerLayout() {
  const { isDark, t } = useTheme();
  return (
    <View className={isDark ? "dark flex-1" : "flex-1"}>
      <StatusBar style={isDark ? "light" : "dark"} translucent={false} backgroundColor={t.bg} />
      <Stack screenOptions={{ headerShown: false }} />
      <ThemeTransitionOverlay />
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <ErrorBoundary>
            <InnerLayout />
          </ErrorBoundary>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
