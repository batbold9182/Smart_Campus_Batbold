import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { gradients, palette, radius, space, type as typeScale } from "../styles/tokens";

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

export default function ScreenLayout({
  title,
  children,
  backRoute,
  headerColors = gradients.primary,
  scrollable = true,
}: Props) {
  const router = useRouter();

  const content = scrollable ? (
    <ScrollView
      className="flex-1 px-5"
      contentContainerStyle={{ paddingBottom: space[5], paddingTop: space[4] }}
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
          paddingHorizontal: space[5],
          paddingVertical: space[4] + 2,
          borderBottomLeftRadius: radius.xl,
          borderBottomRightRadius: radius.xl,
          flexDirection: backRoute ? "row" : undefined,
          alignItems: backRoute ? "center" : undefined,
          gap: backRoute ? space[2] : undefined,
        }}
      >
        {backRoute && (
          <TouchableOpacity onPress={() => router.push(backRoute as any)}>
            <Ionicons name="arrow-back" size={22} color={palette.white} />
          </TouchableOpacity>
        )}
        <Text style={{ fontSize: typeScale.xl.size, fontWeight: "bold", color: palette.white }}>
          {title}
        </Text>
      </LinearGradient>
      {content}
    </SafeAreaView>
  );
}
