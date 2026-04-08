import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { getProfile, type AppUserProfile } from "../../services/userService";
import ProfileCard from "../../components/profileCard";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";
import AnimatedScreen from "../../components/AnimatedScreen";
import { SkeletonRow, SkeletonCard } from "../../components/Skeleton";

export default function FacultyProfile() {
  const [user, setUser] = useState<AppUserProfile | null>(null);
  const { isDark, t, toggleTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    getProfile().then(setUser).catch(() => {});
  }, []);

  if (!user) {
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
          onPress={() => router.push("/faculty/dashboard")}
        >
          <Text style={{ fontWeight: "600", color: "#ffffff" }}>Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
      </AnimatedScreen>
    </SafeAreaView>
  );
}
