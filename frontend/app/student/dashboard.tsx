import { useCallback, useEffect, useMemo } from "react";
import { useRouter } from "expo-router";
import { logout } from "../../services/authService";
import { getStudentSchedule } from "../../services/scheduleService";
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useUserStore } from "../../store/useUserStore";
import { useNotificationStore } from "../../store/useNotificationStore";
import { useScheduleStore } from "../../store/useScheduleStore";
import DashboardTemplate from "../../components/DashboardTemplate";

export default function StudentDashboard() {
  const router = useRouter();
  const { user, fetchUser } = useUserStore();
  const { unreadCount, fetchCount } = useNotificationStore();
  const { todaySchedule, setTodaySchedule } = useScheduleStore();

  const loadTodaySchedule = useCallback(async () => {
    try {
      const all = await getStudentSchedule();
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
    { label: "Create Meeting", subtitle: "Schedule a call", icon: <Ionicons name="videocam" size={24} color="#fff" />, gradient: ["#7c3aed", "#a855f7"] as const, route: "/student/create-meeting" },
    { label: "Grades", subtitle: "View your scores", icon: <MaterialCommunityIcons name="book-open-variant" size={24} color="#fff" />, gradient: ["#16a34a", "#4ade80"] as const, route: "/student/grades" },
    { label: "Attendance", subtitle: "Track records", icon: <MaterialIcons name="fact-check" size={24} color="#fff" />, gradient: ["#ea580c", "#f97316"] as const, route: "/student/attendance" },
    { label: "Vizja Friends", subtitle: "Find buddies", icon: <Ionicons name="heart" size={24} color="#fff" />, gradient: ["#e11d48", "#fb7185"] as const, route: "/student/vizjaFriends" },
    { label: "Assignments", subtitle: "Due tasks", icon: <MaterialIcons name="assignment" size={24} color="#fff" />, gradient: ["#0d9488", "#2dd4bf"] as const, route: "/student/assignments" },
    { label: "Online Library", subtitle: "Browse resources", icon: <MaterialIcons name="local-library" size={24} color="#fff" />, gradient: ["#0891b2", "#22d3ee"] as const, route: "/student/onlineLibrary" },
    { label: "Campus Map", subtitle: "Navigate campus", icon: <Ionicons name="location" size={24} color="#fff" />, gradient: ["#7c3aed", "#a855f7"] as const, route: "/student/buildingMap" },
    { label: "Chat Bot", subtitle: "Ask anything", icon: <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />, gradient: ["#ea580c", "#f97316"] as const, route: "/student/chatBot" },
  ], []);

  if (!user) return null;

  return (
    <DashboardTemplate
      user={user}
      unreadCount={unreadCount}
      todaySchedule={todaySchedule}
      quickActions={quickActions}
      panelTitle="Dashboard"
      roleLabel="Student"
      roleIcon={<Ionicons name="person" size={16} color="#fff" />}
      profileRoute="/student/profile"
      notificationsRoute="/student/notifications"
      scheduleViewAllRoute="/student/schedule"
      showProfessor
      onLogout={async () => { await logout(); router.replace("/auth/login"); }}
    />
  );
}
