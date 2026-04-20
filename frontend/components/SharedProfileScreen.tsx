import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../contexts/ThemeContext";
import AnimatedScreen from "./AnimatedScreen";
import ProfileCard from "./profileCard";
import { SkeletonRow, SkeletonCard } from "./Skeleton";
import type { AppUserProfile } from "../services/userService";
import { gradients, palette, radius, space, type as typeScale } from "../styles/tokens";

type Props = {
  user: AppUserProfile | null;
  loading?: boolean;
  dashboardRoute: string;
};

export default function SharedProfileScreen({ user, loading = false, dashboardRoute }: Props) {
  const { isDark, t, toggleTheme } = useTheme();
  const router = useRouter();

  const headerGradient = isDark ? gradients.primaryDark : gradients.primary;

  const header = (showToggle: boolean) => (
    <LinearGradient
      colors={headerGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{
        paddingHorizontal: space[5],
        paddingVertical: space[4] + 2,
        borderBottomLeftRadius: radius.xl,
        borderBottomRightRadius: radius.xl,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <TouchableOpacity
        onPress={() => router.push(dashboardRoute as any)}
        style={{
          width: 44,
          height: 44,
          borderRadius: radius.full,
          backgroundColor: t.overlayLight,
          alignItems: "center",
          justifyContent: "center",
        }}
        accessibilityLabel="Go back to dashboard"
      >
        <Ionicons name="arrow-back" size={22} color={palette.white} />
      </TouchableOpacity>
      <Text style={{ fontSize: typeScale.xl.size, fontWeight: "bold", color: palette.white }}>
        My Profile
      </Text>
      {showToggle ? (
        <TouchableOpacity
          onPress={toggleTheme}
          style={{
            width: 44,
            height: 44,
            borderRadius: radius.full,
            backgroundColor: t.overlayLight,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name={isDark ? "sunny" : "moon"} size={18} color={palette.white} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 44 }} />
      )}
    </LinearGradient>
  );

  if (loading || !user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={["top"]}>
        {header(false)}
        <View style={{ paddingHorizontal: space[5], paddingTop: space[4] }}>
          <SkeletonRow />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={["top"]}>
      {header(true)}
      <AnimatedScreen>
        <ScrollView
          style={{ flex: 1, paddingHorizontal: space[5] }}
          contentContainerStyle={{ paddingBottom: space[5], paddingTop: space[4] }}
        >
          <ProfileCard user={user} />
          <TouchableOpacity
            style={{
              marginTop: space[4],
              alignItems: "center",
              borderRadius: radius.sm,
              backgroundColor: t.accentBar,
              padding: space[4] - 2,
            }}
            onPress={() => router.push(dashboardRoute as any)}
          >
            <Text style={{ fontWeight: "600", color: palette.white }}>Back to Dashboard</Text>
          </TouchableOpacity>
        </ScrollView>
      </AnimatedScreen>
    </SafeAreaView>
  );
}
