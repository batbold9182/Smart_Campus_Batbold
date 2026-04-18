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

type Props = {
  user: AppUserProfile | null;
  loading?: boolean;
  dashboardRoute: string;
};

export default function SharedProfileScreen({ user, loading = false, dashboardRoute }: Props) {
  const { isDark, t, toggleTheme } = useTheme();
  const router = useRouter();

  const header = (showToggle: boolean) => (
    <LinearGradient
      colors={isDark ? ["#7c3aed", "#a855f7"] : ["#2563eb", "#7c3aed"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{
        paddingHorizontal: 20,
        paddingVertical: 18,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        flexDirection: showToggle ? "row" : undefined,
        alignItems: showToggle ? "center" : undefined,
        justifyContent: showToggle ? "space-between" : undefined,
      }}
    >
      <Text style={{ fontSize: 22, fontWeight: "bold", color: "#ffffff" }}>My Profile</Text>
      {showToggle && (
        <TouchableOpacity
          onPress={toggleTheme}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "rgba(255,255,255,0.2)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name={isDark ? "sunny" : "moon"} size={18} color="#ffffff" />
        </TouchableOpacity>
      )}
    </LinearGradient>
  );

  if (loading || !user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={["top"]}>
        {header(false)}
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
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
          style={{ flex: 1, paddingHorizontal: 20 }}
          contentContainerStyle={{ paddingBottom: 20, paddingTop: 16 }}
        >
          <ProfileCard user={user} />
          <TouchableOpacity
            style={{
              marginTop: 16,
              alignItems: "center",
              borderRadius: 8,
              backgroundColor: t.accentBar,
              padding: 14,
            }}
            onPress={() => router.push(dashboardRoute as any)}
          >
            <Text style={{ fontWeight: "600", color: "#ffffff" }}>Back to Dashboard</Text>
          </TouchableOpacity>
        </ScrollView>
      </AnimatedScreen>
    </SafeAreaView>
  );
}
