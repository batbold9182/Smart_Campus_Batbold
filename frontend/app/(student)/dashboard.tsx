import { View, Text, ScrollView, Pressable, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { logout } from "../../services/authService";
import { useRouter } from "expo-router";
import { getUnreadCount } from "../../services/notificationService";
import { getProfile } from "../../services/userService";
import useAuthGuard from "../../hooks/useAuthGuard";
import { formatTime, formatDate } from "../../services/clockService";
import { getStudentSchedule } from "../../services/scheduleService";

export default function StudentDashboard() {
  const { loading, user: authUser } = useAuthGuard();
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [time, setTime] = useState(new Date());
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);

  const getScheduleStatus = (startTime: string, endTime: string) => {
    const now = time.getHours() * 60 + time.getMinutes();
    const [startH, startM] = String(startTime || "0:0").split(":").map(Number);
    const [endH, endM] = String(endTime || "0:0").split(":").map(Number);
    const start = startH * 60 + startM;
    const end = endH * 60 + endM;

    if (now >= start && now <= end) return "Now";
    if (now < start) return "Upcoming";
    return "Done";
  };

  const loadTodaySchedule = async () => {
    try {
      const allSchedules = await getStudentSchedule();
      const today = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date());
      const filtered = (Array.isArray(allSchedules) ? allSchedules : []).filter((item) => item?.day === today);
      setTodaySchedule(filtered);
    } catch {
      setTodaySchedule([]);
    }
  };

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
    loadTodaySchedule();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  useEffect(() => {
    const load = async () => {
      const profile = await getProfile();

      if (profile.role !== "student") {
        router.replace("/(auth)/login");
        return;
      }

      setUser(profile);
    };

    if (authUser) {
      load();
    }
  }, [authUser, router]);

  if (loading) {
    return <Text className="flex-1 pt-20 text-center text-[18px] text-app-muted">Loading dashboard...</Text>;
  }

  if (!authUser || !user) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={["top"]}>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-4" showsVerticalScrollIndicator={false}>
      <View className="mb-4 flex-row items-start justify-between">
        <View className="flex-1 pr-2">
          <Text className="text-[22px] font-bold text-app-text" numberOfLines={1}>Dashboard</Text>
          <Text className="mt-1 text-app-muted">Welcome, {user?.name}</Text>
        </View>

        <View className="flex-row items-center">
          <View className="mr-3 items-end">
            <Text className="text-[18px] font-bold text-app-text">{formatTime(time)}</Text>
            <Text className="text-[12px] text-app-muted">{formatDate(time)}</Text>
          </View>

          <TouchableOpacity onPress={() => router.push("/(student)/notifications")}>
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
        <View className="flex-1 items-center rounded-xl bg-app-surface py-3 shadow-sm">
          <Text className="text-[16px] font-bold text-app-text">{todaySchedule.length}</Text>
          <Text className="mt-1 text-[11px] text-app-muted">Today Classes</Text>
        </View>
        <View className="flex-1 items-center rounded-xl bg-app-surface py-3 shadow-sm">
          <Text className="text-[16px] font-bold text-app-text">{count}</Text>
          <Text className="mt-1 text-[11px] text-app-muted">Unread Alerts</Text>
        </View>
        <View className="flex-1 items-center rounded-xl bg-app-surface py-3 shadow-sm">
          <Text className="text-[16px] font-bold text-app-text">Student</Text>
          <Text className="mt-1 text-[11px] text-app-muted">Role</Text>
        </View>
      </View>

      <View className="mb-[22px] rounded-xl bg-app-surface p-4 shadow">
        <Text className="mb-[10px] text-[18px] font-bold text-app-text">Today&apos;s Schedule</Text>

        {todaySchedule.length === 0 ? (
          <View className="items-center gap-2 py-[10px]">
            <Text className="text-[28px]">🗓️</Text>
            <Text className="text-app-muted">No classes scheduled today</Text>
            <TouchableOpacity className="rounded-lg bg-blue-500 px-[14px] py-2" onPress={() => router.push("/(student)/schedule")}>
              <Text className="font-semibold text-white">Open Full Schedule</Text>
            </TouchableOpacity>
          </View>
        ) : (
          todaySchedule.map((item, index) => {
            const status = getScheduleStatus(item.startTime, item.endTime);

            return (
              <View key={index} className="mb-3 flex-row items-center border-b border-app-border pb-[10px]">
                <Text className="mr-3 w-[90px] font-bold text-app-text">{item.startTime}-{item.endTime}</Text>
                <View className="flex-1">
                  <Text className="font-semibold text-app-text">{item.course?.title || item.course?.name || item.course?.code || "Course"}</Text>
                  <Text className="mt-[2px] text-[12px] text-[#374151]">Prof: {item.faculty?.name || "Unassigned"}</Text>
                  <Text className="text-[12px] text-app-muted">{item.room}</Text>
                </View>
                <View
                  className={`rounded-full px-[10px] py-1 ${
                    status === "Now" ? "bg-green-100" : status === "Done" ? "bg-gray-200" : "bg-blue-100"
                  }`}
                >
                  <Text className="text-[11px] font-bold text-[#1f2937]">{status}</Text>
                </View>
              </View>
            );
          })
        )}
      </View>

      <View className="mt-[2px] flex-row flex-wrap justify-between">
        <Pressable
          className="mb-[15px] min-h-[118px] w-[48%] items-center rounded-xl bg-app-surface p-[18px] shadow"
          style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
          onPress={() => router.push("/(student)/schedule")}
        >
          <Text className="mb-2 text-[30px]">📅</Text>
          <Text className="font-semibold">My Schedule</Text>
        </Pressable>

        <Pressable
          className="mb-[15px] min-h-[118px] w-[48%] items-center rounded-xl bg-app-surface p-[18px] shadow"
          style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
          onPress={() => router.push("/(student)/notifications")}
        >
          <Text className="mb-2 text-[30px]">🔔</Text>
          <Text className="font-semibold">Notifications</Text>
        </Pressable>

        <Pressable
          className="mb-[15px] min-h-[118px] w-[48%] items-center rounded-xl bg-app-surface p-[18px] shadow"
          style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
          onPress={() => router.push("../profile")}
        >
          <Text className="mb-2 text-[30px]">👤</Text>
          <Text className="font-semibold">Profile</Text>
        </Pressable>

        <Pressable
          className="mb-[15px] min-h-[118px] w-[48%] items-center rounded-xl bg-app-surface p-[18px] shadow"
          style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
          onPress={() => router.push("/(student)/randomChat")}
        >
          <Text className="mb-2 text-[30px]">🍽️❤️</Text>
          <Text className="font-semibold">Lunch buddy</Text>
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
