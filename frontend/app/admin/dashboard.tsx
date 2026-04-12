import { View, Text, Pressable, TouchableOpacity, ScrollView, Image, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useAuthGuard from "../../hooks/useAuthGuard";
import { useEffect, useState } from "react";
import { getProfile } from "../../services/userService";
import { useRouter } from "expo-router";
import { logout } from "../../services/authService";
import { getUnreadCount } from "../../services/notificationService";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import api from "../../config/clientAPI";
import { getDashboardStyles } from "../../styles/dashboardStyles";
import { useTheme } from "../../contexts/ThemeContext";
import { haptic } from "../../utils/haptics";

export default function AdminDashboard() {
  const { width } = useWindowDimensions();
  const { loading, user: authUser } = useAuthGuard();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [time, setTime] = useState(new Date());
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const { isDark, t, toggleTheme } = useTheme();

  const s = getDashboardStyles(t, width, isDark);

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
      const res = await api.get("/api/admin/schedules", { params: { page: 1, limit: 100 } });
      const allSchedules: any[] = Array.isArray(res.data) ? res.data : (res.data?.items || []);
      const today = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date());
      setTodaySchedule(allSchedules.filter((item) => item?.day === today));
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
    loadTodaySchedule();
    loadCount();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace("/auth/login");
  };

  useEffect(() => {
    if (!loading && !authUser) {
      router.replace("/auth/login");
    }
  }, [authUser, loading, router]);

  useEffect(() => {
    const load = async () => {
      const profile = await getProfile();
      if (profile.role !== "admin") {
        router.replace("/auth/login");
        return;
      }
      setUser(profile);
    };
    if (authUser) load();
  }, [authUser, router]);

  if (loading || !authUser || !user) return null;

  const profileUri = user?.profile && user.profile !== "defaultProfile.png" ? user.profile : null;

  const quickActions = [
    { label: "Manage Courses", subtitle: "Create & edit", icon: <MaterialIcons name="menu-book" size={24} color="#fff" />, gradient: ["#7c3aed", "#a855f7"] as const, route: "/admin/create-course" as const },
    { label: "Create Schedule", subtitle: "Add timetable", icon: <Ionicons name="calendar" size={24} color="#fff" />, gradient: ["#16a34a", "#4ade80"] as const, route: "/admin/create-schedule" as const },
    { label: "Assign Schedule", subtitle: "Link to students", icon: <MaterialIcons name="assignment-ind" size={24} color="#fff" />, gradient: ["#ea580c", "#f97316"] as const, route: "/admin/assignSchedule" as const },
    { label: "Create User", subtitle: "Add accounts", icon: <Ionicons name="person-add" size={24} color="#fff" />, gradient: ["#0d9488", "#2dd4bf"] as const, route: "/admin/create-user" as const },
    { label: "Users List", subtitle: "Manage accounts", icon: <Ionicons name="people" size={24} color="#fff" />, gradient: ["#2563eb", "#60a5fa"] as const, route: "/admin/users" as const },
    { label: "Enroll Students", subtitle: "Course enrollment", icon: <MaterialCommunityIcons name="school" size={24} color="#fff" />, gradient: ["#6d28d9", "#8b5cf6"] as const, route: "/admin/enroll" as const },
    { label: "Campus Map", subtitle: "Navigate campus", icon: <Ionicons name="location" size={24} color="#fff" />, gradient: ["#0891b2", "#22d3ee"] as const, route: "/admin/buildingMap" as const },
    { label: "Chat Bot", subtitle: "Ask anything", icon: <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />, gradient: ["#d97706", "#fbbf24"] as const, route: "/admin/chatBot" as const },
  ];

  return (
    <View style={s.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <LinearGradient
          colors={["#6b21a8", "#a21caf", "#db2777"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[s.headerGradient, { paddingTop: insets.top + 4 }]}
        >
          <View style={s.headerLogoWrap}>
            <Image source={require("../../assets/images/logo_long.png")} style={s.headerLogo} resizeMode="contain" />
          </View>
        </LinearGradient>

        <View style={s.contentPadding}>

          {/* Profile row */}
          <View style={s.profileRow}>
            <View style={s.profileRowLeft}>
              <TouchableOpacity onPress={() => router.push("/admin/profile")} style={s.profileAvatarBtn}>
                <View style={s.profileAvatar}>
                  {profileUri ? (
                    <Image source={{ uri: profileUri }} style={s.profileAvatarImage} />
                  ) : (
                    <View style={s.profileAvatarFallback}>
                      <Ionicons name="person" size={24} color="#a78bfa" />
                    </View>
                  )}
                </View>
                <View style={s.onlineDot} />
              </TouchableOpacity>
              <View style={s.profileTextWrap}>
                <Text style={s.profileTitle}>Admin Panel</Text>
                <Text style={s.profileSubtitle}>Welcome back, {user?.name} 👋</Text>
              </View>
            </View>

            <View style={s.headerActions}>
              <TouchableOpacity onPress={toggleTheme} style={s.themeToggle}>
                <Ionicons name={isDark ? "sunny" : "moon"} size={20} color={isDark ? "#facc15" : "#6b21a8"} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push("/admin/notifications")}>
                <View>
                  <Ionicons name="notifications" size={26} color="#facc15" />
                  {count > 0 && (
                    <View style={s.badge}>
                      <Text style={s.badgeText}>{count}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Row */}
          <View style={s.statsRow}>
            <View style={s.statsCard}>
              <View style={s.statsIconWrap("#2563eb")}>
                <Ionicons name="calendar" size={16} color="#fff" />
              </View>
              <Text style={s.statsValue}>{todaySchedule.length}</Text>
              <Text style={s.statsLabel}>Today Classes</Text>
            </View>
            <View style={s.statsCard}>
              <View style={s.statsIconWrap("#eab308")}>
                <Ionicons name="notifications" size={16} color="#fff" />
              </View>
              <Text style={s.statsValue}>{count}</Text>
              <Text style={s.statsLabel}>Unread Alerts</Text>
            </View>
            <View style={s.statsCardGreen}>
              <View style={s.statsIconWrap("#22c55e")}>
                <Ionicons name="shield-checkmark" size={16} color="#fff" />
              </View>
              <Text style={s.statsValue}>Admin</Text>
              <Text style={s.statsLabel}>Your Role</Text>
            </View>
          </View>

          {/* Today's Schedule */}
          <View style={s.scheduleCard}>
            <View style={s.scheduleHeader}>
              <View style={s.sectionTitleRow}>
                <View style={s.accentBar} />
                <Text style={s.sectionTitle}>Today&apos;s Schedule</Text>
              </View>
              <TouchableOpacity onPress={() => router.push("/admin/create-schedule")}>
                <Text style={s.viewAllLink}>View All</Text>
              </TouchableOpacity>
            </View>

            {todaySchedule.length === 0 ? (
              <View style={s.emptyScheduleWrap}>
                <Text style={s.emptyScheduleEmoji}>🗓️</Text>
                <Text style={s.emptyScheduleTitle}>No classes scheduled today</Text>
                <Text style={s.emptyScheduleSubtitle}>Enjoy your free day!</Text>
              </View>
            ) : (
              todaySchedule.map((item, index) => {
                const status = getScheduleStatus(item.startTime, item.endTime);
                return (
                  <View key={index} style={s.scheduleItemRow(index >= todaySchedule.length - 1)}>
                    <Text style={s.scheduleTime}>{item.startTime}-{item.endTime}</Text>
                    <View style={s.scheduleItemContent}>
                      <Text style={s.scheduleCourseName}>{item.course?.title || item.course?.name || item.course?.code || "Course"}</Text>
                      <Text style={s.scheduleProf}>Prof: {item.faculty?.name || "Unassigned"}</Text>
                      <Text style={s.scheduleRoom}>{item.room}</Text>
                    </View>
                    <View style={s.scheduleBadge(status)}>
                      <Text style={s.scheduleBadgeText}>{status}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          {/* Quick Actions */}
          <View style={s.quickActionsSection}>
            <View style={s.quickActionsSectionHeader}>
              <View style={s.accentBar} />
              <Text style={s.sectionTitle}>Quick Actions</Text>
            </View>

            <View style={s.quickActionsGrid}>
              {quickActions.map((action) => (
                <View key={action.label} style={s.quickActionCardWrap}>
                  <Pressable
                    style={({ pressed }) => s.quickActionPressable(pressed, action.gradient[0])}
                    onPress={() => { haptic.light(); router.push(action.route); }}
                  >
                    <LinearGradient colors={action.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.quickActionGradientBar} />
                    <View style={s.quickActionContent}>
                      <LinearGradient colors={action.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.quickActionIconWrap}>
                        {action.icon}
                      </LinearGradient>
                      <Text style={s.quickActionLabel}>{action.label}</Text>
                      <Text style={s.quickActionSubtitle}>{action.subtitle}</Text>
                      <View style={s.quickActionArrowWrap}>
                        <Ionicons name="arrow-forward" size={13} color={action.gradient[0]} />
                      </View>
                    </View>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>

          {/* Logout */}
          <LinearGradient colors={["#e11d48", "#db2777"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.logoutGradient}>
            <TouchableOpacity style={s.logoutButton} onPress={() => { haptic.medium(); handleLogout(); }}>
              <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={s.logoutText}>Logout</Text>
            </TouchableOpacity>
          </LinearGradient>

        </View>
      </ScrollView>
    </View>
  );
}
