import { useCallback, useEffect, useState } from "react";
import api from "../../config/clientAPI";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { facultyStyles } from "../../styles/facultyStyles";
import NotificationFeed, { NotificationItem } from "../../components/notificationFeed";

export default function NotificationsScreen() {
  const NOTIFICATIONS_LIMIT = 5;
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  
  const loadNotifications = async (nextPage = 1) => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/api/notifications", {
        params: { page: nextPage, limit: NOTIFICATIONS_LIMIT },
      });

      if (Array.isArray(res.data)) {
        setNotifications(res.data);
        setPage(1);
        setTotalPages(1);
        return;
      }

      const items = res.data?.items || [];
      const pages = Math.max(Number(res.data?.pagination?.totalPages) || 1, 1);
      setNotifications(items);
      setPage(nextPage);
      setTotalPages(pages);
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to load notifications";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications(1);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotifications(1);
    }, [])
  );

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((item) => (item._id === id ? { ...item, isRead: true } : item))
      );
    } catch {
      setError("Failed to mark notification as read");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={["top"]}>
      <NotificationFeed
        title="Notifications"
        notifications={notifications}
        loading={loading}
        error={error}
        page={page}
        totalPages={totalPages}
        styles={facultyStyles}
        onRetry={() => loadNotifications(1)}
        onMarkAsRead={markAsRead}
        onPrevious={() => loadNotifications(page - 1)}
        onNext={() => loadNotifications(page + 1)}
        onBack={() => router.push("/(faculty)/dashboard")}
      />
    </SafeAreaView>
  );
}

