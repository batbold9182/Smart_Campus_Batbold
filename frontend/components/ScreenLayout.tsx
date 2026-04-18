import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type Props = {
  title: string;
  children: React.ReactNode;
  /** Route to navigate back to. If omitted the system back gesture is relied on. */
  backRoute?: string;
  /** Override the two gradient stop colors. Defaults to blue→purple. */
  headerColors?: readonly [string, string];
  /** When true the content is wrapped in a ScrollView (default: true). */
  scrollable?: boolean;
};

/**
 * Shared wrapper for inner (non-dashboard) screens.
 * Provides: SafeAreaView, gradient title bar with optional back button,
 * and an optional ScrollView around `children`.
 *
 * Usage:
 *   <ScreenLayout title="Grades" backRoute="/student/dashboard">
 *     <YourContent />
 *   </ScreenLayout>
 */
export default function ScreenLayout({
  title,
  children,
  backRoute,
  headerColors = ["#2563eb", "#7c3aed"],
  scrollable = true,
}: Props) {
  const router = useRouter();

  const content = scrollable ? (
    <ScrollView
      className="flex-1 px-5"
      contentContainerStyle={{ paddingBottom: 20, paddingTop: 16 }}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View className="flex-1 px-5 pt-4">{children}</View>
  );

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={["top"]}>
      <LinearGradient
        colors={headerColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          paddingHorizontal: 20,
          paddingVertical: 18,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          flexDirection: backRoute ? "row" : undefined,
          alignItems: backRoute ? "center" : undefined,
          gap: backRoute ? 8 : undefined,
        }}
      >
        {backRoute && (
          <TouchableOpacity onPress={() => router.push(backRoute as any)}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
        )}
        <Text style={{ fontSize: 22, fontWeight: "bold", color: "#ffffff" }}>{title}</Text>
      </LinearGradient>
      {content}
    </SafeAreaView>
  );
}
