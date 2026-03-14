import { useEffect, useState } from "react";
import { View, ActivityIndicator, Text, TouchableOpacity, ScrollView } from "react-native";
import { getProfile, type AppUserProfile } from "../../services/userService";
import ProfileCard from "../../components/profileCard";
import useAuthGuard from "../../hooks/useAuthGuard";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FacultyProfile() {
  const { loading } = useAuthGuard("faculty");
  const [user, setUser] = useState<AppUserProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    getProfile().then(setUser);
  }, []);

  if (loading || !user) {
    return (
      <View className="flex-1 items-center justify-center bg-app-bg">
        <ActivityIndicator size="large" />
        <Text className="mt-2 text-app-muted">Loading profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={["top"]}>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-5">
        <Text className="mb-4 text-[22px] font-bold text-app-text">My Profile</Text>

        <View className="rounded-xl bg-app-surface p-4 shadow">
          <ProfileCard user={user} />
        </View>

        <TouchableOpacity
          className="mt-4 items-center rounded-lg bg-blue-500 p-[14px]"
          onPress={() => router.push("/(faculty)/dashboard")}
        >
          <Text className="font-semibold text-white">Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
