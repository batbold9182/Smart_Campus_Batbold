import { View, Text, Pressable, TouchableOpacity, ScrollView, Image, useWindowDimensions} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useAuthGuard from "../../hooks/useAuthGuard";
import { useEffect, useState } from "react";
import { getProfile } from "../../services/userService";
import { useRouter } from "expo-router";
import { logout } from "../../services/authService";
import { getUnreadCount } from "../../services/notificationService";
import { formatTime, formatDate } from "../../services/clockService";
import api from "../../config/clientAPI";

export default function AdminDashboard() {
  const { width } = useWindowDimensions();
  const { loading, user: authUser } = useAuthGuard();
    const headerLogoSize = width >= 1024 ? 30 : width >= 768 ? 34 : 38;

  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const [count , setCount] = useState(0); 
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
      const res = await api.get("/api/admin/schedules");
      const allSchedules = Array.isArray(res.data) ? res.data : [];
      const today = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date());
      const filtered = allSchedules.filter((item) => item?.day === today);
      setTodaySchedule(filtered);
    } catch (err) {
      setTodaySchedule([]);
      console.log(err, "Failed to load schedule");
    }
  };

useEffect(() => {
  loadTodaySchedule();
}, [])


  useEffect(() => {
  const timer = setInterval(() => {
    setTime(new Date());
  }, 1000);

  return () => clearInterval(timer);
}, []);
  const loadCount = async () => {
    try {
      const data = await getUnreadCount();
      setCount(data?.unreadCount ?? 0);
    } catch {
      setCount(0);
    }
  }
  useEffect(() => {
    loadCount();
  }
  ,[])

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  }
  useEffect(() => {
    if (!loading && !authUser) {
      router.replace("/login");
    }
  }, [authUser, loading, router]);

  useEffect(() => {
    const load = async () => {
      const profile = await getProfile();

      if (profile.role !== "admin") {
        router.replace("/profile");
        return;
      }

      setUser(profile);
    };

    if (authUser) {
      load();
    }
  }, [authUser, router]);

  if (loading) {
    return <Text className="flex-1 pt-20 text-center text-[18px] text-[#666]">Loading admin panel...</Text>;
  }

  if (!authUser || !user) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f5f7fb]" edges={["top"]}>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-4" showsVerticalScrollIndicator={false}>
        <View className="mb-4 flex-row items-center justify-between">
  
  <View className="flex-row items-center">
    <Image
      source={require("../../assets/images/Logo_VIZJA.png")}
      className="mr-2"
      style={{ width: headerLogoSize, height: headerLogoSize }}
      resizeMode="contain"
    />
    <View>
      <Text className="text-[20px] font-bold text-[#111827]">Admin Panel</Text>
      <Text className="text-[#666] text-[12px]">Welcome, {user?.name}</Text>
    </View>
  </View>

  <View className="flex-row items-center">
    <View className="mr-3 items-end">
      <Text className="text-[16px] font-bold text-[#111827]">{formatTime(time)}</Text>
      <Text className="text-[11px] text-[#666]">{formatDate(time)}</Text>
    </View>

    <TouchableOpacity onPress={() => router.push("/(admin)/notifications")}>
      <View className="relative">
        <Text className="text-[24px]">🔔</Text>
        {count > 0 && (
          <View className="absolute -right-[6px] -top-1 rounded-full bg-red-500 px-[6px]">
            <Text className="text-[11px] font-bold text-white">{count}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  </View>

</View>

      <View className="mb-4 flex-row justify-between gap-2">
        <View className="flex-1 items-center rounded-xl bg-white py-3 shadow-sm">
          <Text className="text-[16px] font-bold text-[#111827]">{todaySchedule.length}</Text>
          <Text className="mt-1 text-[11px] text-[#6b7280]">Today Classes</Text>
        </View>
        <View className="flex-1 items-center rounded-xl bg-white py-3 shadow-sm">
          <Text className="text-[16px] font-bold text-[#111827]">{count}</Text>
          <Text className="mt-1 text-[11px] text-[#6b7280]">Unread Alerts</Text>
        </View>
        <View className="flex-1 items-center rounded-xl bg-white py-3 shadow-sm">
          <Text className="text-[16px] font-bold text-[#111827]">Admin</Text>
          <Text className="mt-1 text-[11px] text-[#6b7280]">Role</Text>
        </View>
      </View>

      <View className="mb-[22px] rounded-xl bg-white p-4 shadow">
        <Text className="mb-[10px] text-[18px] font-bold text-[#111827]">📅 Todays Schedule</Text>

        {todaySchedule.length === 0 ? (
          <View className="items-center gap-2 py-[10px]">
            <Text className="text-[28px]">🗓️</Text>
            <Text className="text-[#888]">No classes scheduled today</Text>
          </View>
        ) : (
          todaySchedule.map((item, index) => {
            const status = getScheduleStatus(item.startTime, item.endTime);

            return (
              <View key={index} className="mb-3 flex-row items-center border-b border-[#edf0f4] pb-[10px]">
                <Text className="mr-3 w-[90px] font-bold text-[#111827]">{item.startTime}-{item.endTime}</Text>
                <View className="flex-1">
                  <Text className="font-semibold text-[#111827]">{item.course?.title || item.course?.name || item.course?.code || "Course"}</Text>
                  <Text className="mt-[2px] text-[12px] text-[#374151]">Prof: {item.faculty?.name || "Unassigned"}</Text>
                  <Text className="text-[12px] text-[#666]">{item.room}</Text>
                </View>
                <View
                  className={`rounded-full px-[10px] py-1 ${
                    status === "Now"
                      ? "bg-green-100"
                      : status === "Done"
                      ? "bg-gray-200"
                      : "bg-blue-100"
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
        <Pressable className="mb-[15px] min-h-[118px] w-[48%] items-center rounded-xl bg-white p-[18px] shadow" style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]} onPress={() => router.push("/(admin)/create-course")}>
          <Text className="mb-2 text-[30px]">📚</Text>
          <Text className="font-semibold">Manage Courses</Text>
        </Pressable>

        <Pressable className="mb-[15px] min-h-[118px] w-[48%] items-center rounded-xl bg-white p-[18px] shadow" style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]} onPress={() => router.push("/(admin)/create-schedule")}>
          <Text className="mb-2 text-[30px]">➕</Text>
          <Text className="font-semibold">Create Schedule</Text>
        </Pressable>

        <Pressable className="mb-[15px] min-h-[118px] w-[48%] items-center rounded-xl bg-white p-[18px] shadow" style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]} onPress={() => router.push("/(admin)/assignSchedule")}>
          <Text className="mb-2 text-[30px]">📅</Text>
          <Text className="font-semibold">Assign Schedule</Text>
        </Pressable>

        <Pressable className="mb-[15px] min-h-[118px] w-[48%] items-center rounded-xl bg-white p-[18px] shadow" style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]} onPress={() => router.push("/(admin)/create-faculty")}>
          <Text className="mb-2 text-[30px]">👨‍🏫</Text>
          <Text className="font-semibold">Create User</Text>
        </Pressable>

        <Pressable className="mb-[15px] min-h-[118px] w-[48%] items-center rounded-xl bg-white p-[18px] shadow" style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]} onPress={() => router.push("/(admin)/users")}>
          <Text className="mb-2 text-[30px]">👤</Text>
          <Text className="font-semibold">Users List</Text>
        </Pressable>

        <Pressable className="mb-[15px] min-h-[118px] w-[48%] items-center rounded-xl bg-white p-[18px] shadow" style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]} onPress={() => router.push("/(admin)/enroll")}>
          <Text className="mb-2 text-[30px]">🎓</Text>
          <Text className="font-semibold">Enroll Students</Text>
        </Pressable>

        <Pressable className="mb-[15px] min-h-[118px] w-[48%] items-center rounded-xl bg-white p-[18px] shadow" style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]} onPress={() => router.push("/(admin)/profile")}>
          <Text className="mb-2 text-[30px]">👤</Text>
          <Text className="font-semibold">Profile</Text>
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
