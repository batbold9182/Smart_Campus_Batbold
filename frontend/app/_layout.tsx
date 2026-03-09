import { Stack } from "expo-router";
import "../global.css";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" translucent={false} backgroundColor="#f5f7fb" />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
