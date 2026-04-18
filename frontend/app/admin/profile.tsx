import { useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useUserStore } from "../../store/useUserStore";
import ProfileCard from "../../components/profileCard";
import useAuthGuard from "../../hooks/useAuthGuard";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";
import AnimatedScreen from "../../components/AnimatedScreen";
import { SkeletonRow, SkeletonCard } from "../../components/Skeleton";

export default function AdminProfile() {
  const { loading } = useAuthGuard("admin");
  const { user, fetchUser } = useUserStore();
  const { isDark, t, toggleTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!user) fetchUser();
  }, [user, fetchUser]);

  if (loading || !user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={["top"]}>
        <LinearGradient colors={isDark ? ["#7c3aed", "#a855f7"] : ["#2563eb", "#7c3aed"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingHorizontal: 20, paddingVertical: 18, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
          <Text style={{ fontSize: 22, fontWeight: "bold", color: "#ffffff" }}>My Profile</Text>
        </LinearGradient>
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
      <LinearGradient colors={isDark ? ["#7c3aed", "#a855f7"] : ["#2563eb", "#7c3aed"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingHorizontal: 20, paddingVertical: 18, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 22, fontWeight: "bold", color: "#ffffff" }}>My Profile</Text>
        <TouchableOpacity
          onPress={toggleTheme}
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name={isDark ? "sunny" : "moon"} size={18} color="#ffffff" />
        </TouchableOpacity>
      </LinearGradient>
      <AnimatedScreen>
      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} contentContainerStyle={{ paddingBottom: 20, paddingTop: 16 }}>

        <ProfileCard user={user} />

        <TouchableOpacity
          style={{ marginTop: 16, alignItems: "center", borderRadius: 8, backgroundColor: t.accentBar, padding: 14 }}
          onPress={() => router.push("/admin/dashboard")}
        >
          <Text style={{ fontWeight: "600", color: "#ffffff" }}>Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
      </AnimatedScreen>
    </SafeAreaView>
  );
}
