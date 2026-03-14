import { View, Text, ScrollView, Pressable, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {logout} from "../../services/authService";
import { useEffect, useState } from "react";
import { getUnreadCount } from "../../services/notificationService";
import { getProfile } from "../../services/userService";
import useAuthGuard from "../../hooks/useAuthGuard";
import { formatTime, formatDate } from "../../services/clockService";

export default function FacultyDashboard() {
  const { loading, user: authUser } = useAuthGuard();
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [time, setTime] = useState(new Date());

  const loadCount = async () => {
    try {
      const data = await getUnreadCount();
      setCount(data?.unreadCount ?? 0);
    } catch {
      setCount(0);
    }
  };

  useEffect(() => {
    loadCount();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const load = async () => {
      const profile = await getProfile();

      if (profile.role !== "faculty") {
        router.replace("/(auth)/login");
        return;
      }

      setUser(profile);
    };

    if (authUser) {
      load();
    }
  }, [authUser, router]);

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  }

  if (loading) {
    return <Text className="flex-1 pt-20 text-center text-[18px] text-[#666]">Loading dashboard...</Text>;
  }

  if (!authUser || !user) {
    return null;
  }
// Back to courses
  return (
    <SafeAreaView className="flex-1 bg-[#f5f7fb]" edges={["top"]}>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-4" showsVerticalScrollIndicator={false}>
      <View className="mb-4 flex-row items-start justify-between">
        <View className="flex-1 pr-2">
          <Text className="text-[22px] font-bold text-[#111827]" numberOfLines={1}>Dashboard</Text>
          <Text className="mt-1 text-[#666]">Welcome, {user?.name}</Text>
        </View>

        <View className="flex-row items-center">
          <View className="mr-3 items-end">
            <Text className="text-[18px] font-bold text-[#111827]">{formatTime(time)}</Text>
            <Text className="text-[12px] text-[#666]">{formatDate(time)}</Text>
          </View>

          <TouchableOpacity onPress={() => router.push("/(faculty)/notifications")}>
            <View className="relative">
              <Text className="text-[26px]">🔔</Text>

              {count > 0 && (
                <View className="absolute -right-[6px] -top-1 rounded-full bg-red-500 px-[6px]">
                  <Text className="text-[12px] font-bold text-white">{count}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View className="mb-4 flex-row justify-between gap-2">
        <View className="flex-1 items-center rounded-xl bg-white py-3 shadow-sm">
          <Text className="text-[16px] font-bold text-[#111827]">{count}</Text>
          <Text className="mt-1 text-[11px] text-[#6b7280]">Unread Alerts</Text>
        </View>
        <View className="flex-1 items-center rounded-xl bg-white py-3 shadow-sm">
          <Text className="text-[16px] font-bold text-[#111827]">Courses</Text>
          <Text className="mt-1 text-[11px] text-[#6b7280]">Overview</Text>
        </View>
        <View className="flex-1 items-center rounded-xl bg-white py-3 shadow-sm">
          <Text className="text-[16px] font-bold text-[#111827]">Faculty</Text>
          <Text className="mt-1 text-[11px] text-[#6b7280]">Role</Text>
        </View>
      </View>

      <View className="mb-[22px] rounded-xl bg-white p-4 shadow">
        <Text className="mb-2 text-[18px] font-bold text-[#111827]">Today</Text>
        <Text className="text-[#6b7280]">Review course pages and notifications to keep classes and announcements up to date.</Text>
      </View>

      <View className="mt-[2px] flex-row flex-wrap justify-between">
        <Pressable
          className="mb-[15px] min-h-[118px] w-[48%] items-center rounded-xl bg-white p-[18px] shadow"
          style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
          onPress={() => router.push("/(faculty)/courses")}
        >
          <Text className="mb-2 text-[30px]">📚</Text>
          <Text className="font-semibold">My Courses</Text>
        </Pressable>

        <Pressable
          className="mb-[15px] min-h-[118px] w-[48%] items-center rounded-xl bg-white p-[18px] shadow"
          style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
          onPress={() => router.push("/(faculty)/assignments")}
        >
          <Text className="mb-2 text-[30px]">📖</Text>
          <Text className="font-semibold">Assignments</Text>
        </Pressable>

        <Pressable
          className="mb-[15px] min-h-[118px] w-[48%] items-center rounded-xl bg-white p-[18px] shadow"
          style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
          onPress={() => router.push("/(faculty)/attendance")}
        >
          <Text className="mb-2 text-[30px]">📝</Text>
          <Text className="font-semibold">Attendance Check</Text>
        </Pressable>
              
        <Pressable
          className="mb-[15px] min-h-[118px] w-[48%] items-center rounded-xl bg-white p-[18px] shadow"
          style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
          onPress={() => router.push("/(faculty)/notifications")}
        >
          <Text className="mb-2 text-[30px]">🔔</Text>
          <Text className="font-semibold">Notifications</Text>
        </Pressable>

        <Pressable
          className="mb-[15px] min-h-[118px] w-[48%] items-center rounded-xl bg-white p-[18px] shadow"
          style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
          onPress={() => router.push("/(faculty)/profile")}
        >
          <Text className="mb-2 text-[30px]">👤</Text>
          <Text className="font-semibold">Profile</Text>
        </Pressable>

        <Pressable
          className="mb-[15px] min-h-[118px] w-[48%] items-center rounded-xl bg-white p-[18px] shadow"
          style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
          onPress={() => router.push("/(faculty)/exam")}
        >
          <Text className="mb-2 text-[30px]">📝</Text>
          <Text className="font-semibold">Exam</Text>
        </Pressable>
      </View>

      <View className="mt-3">
        

        <TouchableOpacity className="items-center rounded-lg bg-red-500 p-[14px]" onPress={handleLogout}>
          <Text className="font-semibold text-white">Logout</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}
