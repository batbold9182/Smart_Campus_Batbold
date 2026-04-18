import { useCallback, useEffect, useMemo } from "react";
import { useRouter } from "expo-router";
import { logout } from "../../services/authService";
import { getFacultySchedule } from "../../services/scheduleService";
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useUserStore } from "../../store/useUserStore";
import { useNotificationStore } from "../../store/useNotificationStore";
import { useScheduleStore } from "../../store/useScheduleStore";
import DashboardTemplate from "../../components/DashboardTemplate";

export default function FacultyDashboard() {
  const router = useRouter();
  const { user, fetchUser } = useUserStore();
  const { unreadCount, fetchCount } = useNotificationStore();
  const { todaySchedule, setTodaySchedule } = useScheduleStore();

  const loadTodaySchedule = useCallback(async () => {
    try {
      const all = await getFacultySchedule();
      const today = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date());
      setTodaySchedule((Array.isArray(all) ? all : []).filter((item) => item?.day === today));
    } catch {
      setTodaySchedule([]);
    }
  }, [setTodaySchedule]);

  useEffect(() => {
    fetchUser();
    fetchCount();
    loadTodaySchedule();
  }, [fetchUser, fetchCount, loadTodaySchedule]);

  const quickActions = useMemo(() => [
    { label: "My Courses", subtitle: "Manage classes", icon: <MaterialIcons name="menu-book" size={24} color="#fff" />, gradient: ["#7c3aed", "#a855f7"] as const, route: "/faculty/courses" },
    { label: "Assignments", subtitle: "Review tasks", icon: <MaterialIcons name="assignment" size={24} color="#fff" />, gradient: ["#0d9488", "#2dd4bf"] as const, route: "/faculty/assignments" },
    { label: "Grades", subtitle: "Record scores", icon: <MaterialCommunityIcons name="book-open-variant" size={24} color="#fff" />, gradient: ["#16a34a", "#4ade80"] as const, route: "/faculty/grades" },
    { label: "Attendance", subtitle: "Track presence", icon: <MaterialIcons name="fact-check" size={24} color="#fff" />, gradient: ["#ea580c", "#f97316"] as const, route: "/faculty/attendance" },
    { label: "Exam", subtitle: "Schedule exams", icon: <MaterialIcons name="edit-document" size={24} color="#fff" />, gradient: ["#2563eb", "#60a5fa"] as const, route: "/faculty/exam" },
    { label: "Campus Map", subtitle: "Navigate campus", icon: <Ionicons name="location" size={24} color="#fff" />, gradient: ["#0891b2", "#22d3ee"] as const, route: "/faculty/buildingMap" },
    { label: "Chat Bot", subtitle: "Ask anything", icon: <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />, gradient: ["#d97706", "#fbbf24"] as const, route: "/faculty/chatBot" },
  ], []);

  if (!user) return null;

  return (
    <DashboardTemplate
      user={user}
      unreadCount={unreadCount}
      todaySchedule={todaySchedule}
      quickActions={quickActions}
      panelTitle="Dashboard"
      roleLabel="Faculty"
      roleIcon={<Ionicons name="person" size={16} color="#fff" />}
      profileRoute="/faculty/profile"
      notificationsRoute="/faculty/notifications"
      scheduleViewAllRoute="/faculty/courses"
      onLogout={async () => { await logout(); router.replace("/auth/login"); }}
    />
  );
}
