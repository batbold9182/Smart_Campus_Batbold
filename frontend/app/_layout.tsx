import { Stack } from "expo-router";
import "../global.css";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";
import { AuthProvider } from "../contexts/AuthContext";
import { ThemeTransitionOverlay } from "../components/ThemeTransitionOverlay";
import { ErrorBoundary } from "../components/ErrorBoundary";
import OfflineBanner from "../components/OfflineBanner";
import Toast from "react-native-toast-message";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,       // 30 s before a query is considered stale
      gcTime: 5 * 60_000,      // 5 min cache retention after unmount
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function InnerLayout() {
  const { isDark, t } = useTheme();
  return (
    <View className={isDark ? "dark flex-1" : "flex-1"}>
      <StatusBar style={isDark ? "light" : "dark"} translucent={false} backgroundColor={t.bg} />
      <Stack screenOptions={{ headerShown: false }} />
      <ThemeTransitionOverlay />
      <OfflineBanner />
      <Toast />
    </View>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <ErrorBoundary>
              <InnerLayout />
            </ErrorBoundary>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
