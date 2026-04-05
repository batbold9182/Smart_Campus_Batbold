import { View, Text, ScrollView, Pressable, TouchableOpacity, Image, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { logout } from "../../services/authService";
import { useRouter } from "expo-router";
import { getUnreadCount } from "../../services/notificationService";
import { getProfile } from "../../services/userService";
import { getStudentSchedule } from "../../services/scheduleService";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { getTheme } from "../../styles/theme";

export default function StudentDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [count, setCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [time, setTime] = useState(new Date());
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [isDark, setIsDark] = useState(true);

  const t = getTheme(isDark);

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
    router.replace("/auth/login");
  };

  useEffect(() => {
    const load = async () => {
      try {
        const profile = await getProfile();
        setUser(profile);
      } catch {
        // layout handles auth; ignore profile errors here
      }
    };
    load();
  }, []);

  const profileUri = user?.profile && user.profile !== "defaultProfile.png" ? user.profile : null;
  const quickActionCardWidth = Math.max((width - 52) / 2, 140);

  if (!user) {
    return null;
  }

  const quickActions = [
    { label: "Create Meeting", subtitle: "Schedule a call", icon: <Ionicons name="videocam" size={24} color="#fff" />, gradient: ["#7c3aed", "#a855f7"] as const, route: "/student/create-meeting" as const },
    { label: "Grades", subtitle: "View your scores", icon: <MaterialCommunityIcons name="book-open-variant" size={24} color="#fff" />, gradient: ["#16a34a", "#4ade80"] as const, route: "/student/grades" as const },
    { label: "Attendance", subtitle: "Track records", icon: <MaterialIcons name="fact-check" size={24} color="#fff" />, gradient: ["#ea580c", "#f97316"] as const, route: "/student/attendance" as const },
    { label: "Vizja Friends", subtitle: "Find buddies", icon: <Ionicons name="heart" size={24} color="#fff" />, gradient: ["#e11d48", "#fb7185"] as const, route: "/student/vizjaFriends" as const },
    { label: "Assignments", subtitle: "Due tasks", icon: <MaterialIcons name="assignment" size={24} color="#fff" />, gradient: ["#0d9488", "#2dd4bf"] as const, route: "/student/assignments" as const },
    { label: "Online Library", subtitle: "Browse resources", icon: <MaterialIcons name="local-library" size={24} color="#fff" />, gradient: ["#0891b2", "#22d3ee"] as const, route: "/student/onlineLibrary" as const },
    { label: "Campus Map", subtitle: "Navigate campus", icon: <Ionicons name="location" size={24} color="#fff" />, gradient: ["#7c3aed", "#a855f7"] as const, route: "/student/buildingMap" as const },
    { label: "Chat Bot", subtitle: "Ask anything", icon: <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />, gradient: ["#ea580c", "#f97316"] as const, route: "/student/chatBot" as const },
  ];
  return (
    <View className="flex-1" style={{ backgroundColor: t.bg }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <LinearGradient
            colors={["#6b21a8", "#a21caf", "#db2777"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ paddingHorizontal: 20, paddingTop: insets.top + 4, paddingBottom: 8, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
          >
            <View className="items-center justify-center">
              <Image source={require("../../assets/images/logo_long.png")} style={{ width: 360, height: 80 }} resizeMode="contain" />
            </View>
          </LinearGradient>

          <View className="px-5">

            {/* Dashboard Row: Profile, Title, Weather, Bell */}
            <View className="mb-4 mt-5 flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <TouchableOpacity onPress={() => router.push("/student/profile")} className="mr-3">
                  <View style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: "#22c55e", overflow: "hidden", backgroundColor: t.avatarBg }}>
                    {profileUri ? (
                      <Image source={{ uri: profileUri }} style={{ width: 44, height: 44, borderRadius: 22 }} />
                    ) : (
                      <View className="flex-1 items-center justify-center">
                        <Ionicons name="person" size={24} color="#a78bfa" />
                      </View>
                    )}
                  </View>
                  <View style={{ position: "absolute", bottom: 0, left: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: "#22c55e", borderWidth: 2, borderColor: t.greenBorderBg }} />
                </TouchableOpacity>
                <View className="flex-1">
                  <Text style={{ fontSize: 22, fontWeight: "bold", color: t.text }}>Dashboard</Text>
                  <Text style={{ color: t.muted, fontSize: 13 }}>Welcome back, {user?.name} 👋</Text>
                </View>
              </View>

              <View className="flex-row items-center">
                <TouchableOpacity onPress={() => setIsDark(!isDark)} style={{ marginRight: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: t.avatarBg, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: t.cardBorder }}>
                  <Ionicons name={isDark ? "sunny" : "moon"} size={20} color={isDark ? "#facc15" : "#6b21a8"} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/student/notifications")}>
                  <View className="relative">
                    <Ionicons name="notifications" size={26} color="#facc15" />
                    {count > 0 && (
                      <View style={{ position: "absolute", top: -4, right: -6, backgroundColor: "#ef4444", borderRadius: 10, minWidth: 18, height: 18, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 }}>
                        <Text style={{ color: "#fff", fontSize: 10, fontWeight: "bold" }}>{count}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Stats Row */}
            <View className="mb-4 flex-row gap-2">
              <View style={{ flex: 1, backgroundColor: t.surface, borderRadius: 12, borderWidth: 1, borderColor: t.cardBorder, paddingVertical: 10, alignItems: "center" }}>
                <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#2563eb", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
                  <Ionicons name="calendar" size={16} color="#fff" />
                </View>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: t.text }}>{todaySchedule.length}</Text>
                <Text style={{ color: t.muted, fontSize: 10, marginTop: 1 }}>Today Classes</Text>
              </View>

              <View style={{ flex: 1, backgroundColor: t.surface, borderRadius: 12, borderWidth: 1, borderColor: t.cardBorder, paddingVertical: 10, alignItems: "center" }}>
                <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#eab308", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
                  <Ionicons name="notifications" size={16} color="#fff" />
                </View>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: t.text }}>{count}</Text>
                <Text style={{ color: t.muted, fontSize: 10, marginTop: 1 }}>Unread Alerts</Text>
              </View>

              <View style={{ flex: 1, backgroundColor: t.surface, borderRadius: 12, borderWidth: 1, borderColor: "#22c55e", paddingVertical: 10, alignItems: "center" }}>
                <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#22c55e", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
                  <Ionicons name="person" size={16} color="#fff" />
                </View>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: t.text }}>Student</Text>
                <Text style={{ color: t.muted, fontSize: 10, marginTop: 1 }}>Your Role</Text>
              </View>
            </View>

            {/* Today's Schedule */}
            <View style={{ backgroundColor: t.surface, borderRadius: 16, borderWidth: 1, borderColor: t.cardBorder, padding: 16, marginBottom: 24 }}>
              <View className="mb-3 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View style={{ width: 4, height: 20, backgroundColor: t.accentBar, borderRadius: 2, marginRight: 8 }} />
                  <Text style={{ fontSize: 18, fontWeight: "bold", color: t.text }}>Today&apos;s Schedule</Text>
                </View>
                <TouchableOpacity onPress={() => router.push("/student/schedule")}>
                  <Text style={{ color: t.scheduleLink, fontSize: 13 }}>View All</Text>
                </TouchableOpacity>
              </View>

              {todaySchedule.length === 0 ? (
                <View className="items-center py-4">
                  <Text style={{ fontSize: 40, marginBottom: 8 }}>🗓️</Text>
                  <Text style={{ fontSize: 15, fontWeight: "600", color: t.text }}>No classes scheduled today</Text>
                  <Text style={{ color: t.muted, fontSize: 13, marginTop: 2 }}>Enjoy your free day!</Text>
                </View>
              ) : (
                todaySchedule.map((item, index) => {
                  const status = getScheduleStatus(item.startTime, item.endTime);

                  return (
                    <View key={index} style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: index < todaySchedule.length - 1 ? 1 : 0, borderBottomColor: t.schedDivider, paddingBottom: 10, marginBottom: 10 }}>
                      <Text style={{ marginRight: 12, width: 90, fontWeight: "bold", color: t.text }}>{item.startTime}-{item.endTime}</Text>
                      <View className="flex-1">
                        <Text style={{ fontWeight: "600", color: t.text }}>{item.course?.title || item.course?.name || item.course?.code || "Course"}</Text>
                        <Text style={{ color: t.prof, fontSize: 12, marginTop: 2 }}>Prof: {item.faculty?.name || "Unassigned"}</Text>
                        <Text style={{ color: t.muted, fontSize: 12 }}>{item.room}</Text>
                      </View>
                      <View
                        style={{
                          backgroundColor: status === "Now" ? "#22c55e" : status === "Done" ? "#6b7280" : "#3b82f6",
                          borderRadius: 12,
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                        }}
                      >
                        <Text style={{ color: "#fff", fontSize: 11, fontWeight: "bold" }}>{status}</Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>

            {/* Quick Actions */}
            <View style={{ marginBottom: 16 }}>
              <View className="mb-4 flex-row items-center">
                <View style={{ width: 4, height: 20, backgroundColor: t.accentBar, borderRadius: 2, marginRight: 8 }} />
                <Text style={{ fontSize: 18, fontWeight: "bold", color: t.text }}>Quick Actions</Text>
              </View>

              <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
                {quickActions.map((action) => (
                  <View key={action.label} style={{ width: quickActionCardWidth, marginBottom: 14 }}>
                    <Pressable
                      style={({ pressed }) => ({
                        width: "100%",
                        backgroundColor: t.surface,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: pressed ? action.gradient[0] : t.cardBorder,
                        overflow: "hidden",
                        transform: [{ scale: pressed ? 0.96 : 1 }],
                        shadowColor: action.gradient[0],
                        shadowOffset: { width: 0, height: pressed ? 2 : 6 },
                        shadowOpacity: isDark ? 0.35 : 0.12,
                        shadowRadius: pressed ? 4 : 14,
                        elevation: pressed ? 2 : 6,
                      })}
                      onPress={() => router.push(action.route)}
                    >
                      {/* Gradient accent bar at top */}
                      <LinearGradient
                        colors={action.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ height: 4, width: "100%" }}
                      />
                      <View style={{ paddingVertical: 20, paddingHorizontal: 14, alignItems: "center", justifyContent: "center" }}>
                        {/* Icon with gradient background */}
                        <LinearGradient
                          colors={action.gradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={{ width: 50, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 10 }}
                        >
                          {action.icon}
                        </LinearGradient>
                        <Text style={{ fontSize: 15, fontWeight: "700", color: t.text, textAlign: "center", marginBottom: 2 }}>{action.label}</Text>
                        <Text style={{ fontSize: 11, color: t.muted, textAlign: "center" }}>{action.subtitle}</Text>
                        {/* Arrow indicator */}
                        <View style={{ marginTop: 8, width: 24, height: 24, borderRadius: 12, backgroundColor: isDark ? "rgba(168,85,247,0.15)" : "rgba(124,58,237,0.08)", alignItems: "center", justifyContent: "center" }}>
                          <Ionicons name="arrow-forward" size={13} color={action.gradient[0]} />
                        </View>
                      </View>
                    </Pressable>
                  </View>
                ))}
              </View>
            </View>

            {/* Logout */}
            <LinearGradient
              colors={["#e11d48", "#db2777"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ borderRadius: 12, marginBottom: 16 }}
            >
              <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 16 }} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text className="text-[16px] font-semibold text-white">Logout</Text>
              </TouchableOpacity>
            </LinearGradient>

          </View>
        </ScrollView>
    </View>
  );
}
