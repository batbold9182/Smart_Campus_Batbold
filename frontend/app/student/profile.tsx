import { useEffect, useState } from "react";
import { View, ActivityIndicator, Text, TouchableOpacity, ScrollView } from "react-native";
import { getProfile, type AppUserProfile } from "../../services/userService";
import ProfileCard from "../../components/profileCard";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";

export default function StudentProfile() {
  const [user, setUser] = useState<AppUserProfile | null>(null);
  const { isDark, t, toggleTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    getProfile().then(setUser).catch(() => {});
  }, []);

  if (!user) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: t.bg }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8, color: t.muted }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={["top"]}>
      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <Text style={{ fontSize: 22, fontWeight: "bold", color: t.text }}>My Profile</Text>
          <TouchableOpacity
            onPress={toggleTheme}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: t.avatarBg, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: t.cardBorder }}
          >
            <Ionicons name={isDark ? "sunny" : "moon"} size={18} color={isDark ? "#facc15" : "#6b21a8"} />
          </TouchableOpacity>
        </View>

        <ProfileCard user={user} />

        <TouchableOpacity
          style={{ marginTop: 16, alignItems: "center", borderRadius: 8, backgroundColor: t.accentBar, padding: 14 }}
          onPress={() => router.push("/student/dashboard")}
        >
          <Text style={{ fontWeight: "600", color: "#ffffff" }}>Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
