import { useCallback, useEffect, useMemo } from "react";
import { useRouter } from "expo-router";
import { logout } from "../../services/authService";
import { getAdminSchedules } from "../../services/scheduleService";
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import useAuthGuard from "../../hooks/useAuthGuard";
import { useUserStore } from "../../store/useUserStore";
import { useNotificationStore } from "../../store/useNotificationStore";
import { useScheduleStore } from "../../store/useScheduleStore";
import DashboardTemplate from "../../components/DashboardTemplate";

export default function AdminDashboard() {
  const router = useRouter();
  const { loading, user: authUser } = useAuthGuard();
  const { user, fetchUser } = useUserStore();
  const { unreadCount, fetchCount } = useNotificationStore();
  const { todaySchedule, setTodaySchedule } = useScheduleStore();

  const loadTodaySchedule = useCallback(async (signal: AbortSignal) => {
    try {
      const all = await getAdminSchedules(1, 100, signal);
      const today = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date());
      setTodaySchedule(all.filter((item: any) => item?.day === today));
    } catch (err: any) {
      if (err?.name !== "CanceledError" && err?.code !== "ERR_CANCELED") setTodaySchedule([]);
    }
  }, [setTodaySchedule]);

  useEffect(() => {
    const controller = new AbortController();
    loadTodaySchedule(controller.signal);
    fetchCount(controller.signal);
    return () => controller.abort();
  }, [loadTodaySchedule, fetchCount]);

  useEffect(() => {
    if (!loading && !authUser) router.replace("/auth/login");
  }, [authUser, loading, router]);

  useEffect(() => {
    if (authUser) fetchUser();
  }, [authUser, fetchUser]);

  const quickActions = useMemo(() => [
    { label: "Manage Courses", subtitle: "Create & edit", icon: <MaterialIcons name="menu-book" size={24} color="#fff" />, gradient: ["#7c3aed", "#a855f7"] as const, route: "/admin/create-course" },
    { label: "Create Schedule", subtitle: "Add timetable", icon: <Ionicons name="calendar" size={24} color="#fff" />, gradient: ["#16a34a", "#4ade80"] as const, route: "/admin/create-schedule" },
    { label: "Assign Schedule", subtitle: "Link to students", icon: <MaterialIcons name="assignment-ind" size={24} color="#fff" />, gradient: ["#ea580c", "#f97316"] as const, route: "/admin/assignSchedule" },
    { label: "Create User", subtitle: "Add accounts", icon: <Ionicons name="person-add" size={24} color="#fff" />, gradient: ["#0d9488", "#2dd4bf"] as const, route: "/admin/create-user" },
    { label: "Users List", subtitle: "Manage accounts", icon: <Ionicons name="people" size={24} color="#fff" />, gradient: ["#2563eb", "#60a5fa"] as const, route: "/admin/users" },
    { label: "Enroll Students", subtitle: "Course enrollment", icon: <MaterialCommunityIcons name="school" size={24} color="#fff" />, gradient: ["#6d28d9", "#8b5cf6"] as const, route: "/admin/enroll" },
    { label: "Campus Map", subtitle: "Navigate campus", icon: <Ionicons name="location" size={24} color="#fff" />, gradient: ["#0891b2", "#22d3ee"] as const, route: "/admin/buildingMap" },
    { label: "Chat Bot", subtitle: "Ask anything", icon: <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />, gradient: ["#d97706", "#fbbf24"] as const, route: "/admin/chatBot" },
  ], []);

  if (loading || !authUser || !user) return null;

  return (
    <DashboardTemplate
      user={user}
      unreadCount={unreadCount}
      todaySchedule={todaySchedule}
      quickActions={quickActions}
      panelTitle="Admin Panel"
      roleLabel="Admin"
      roleIcon={<Ionicons name="shield-checkmark" size={16} color="#fff" />}
      profileRoute="/admin/profile"
      notificationsRoute="/admin/notifications"
      scheduleViewAllRoute="/admin/create-schedule"
      showProfessor
      onLogout={async () => { await logout(); router.replace("/auth/login"); }}
    />
  );
}
