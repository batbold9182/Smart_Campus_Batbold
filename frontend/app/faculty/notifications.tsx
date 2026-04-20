import { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { getNotifications, markNotificationRead } from "../../services/notificationService";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { facultyStyles } from "../../styles/facultyStyles";
import NotificationFeed, { NotificationItem } from "../../components/notificationFeed";

export default function NotificationsScreen() {
  const NOTIFICATIONS_LIMIT = 6;
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

      const data = await getNotifications(nextPage, NOTIFICATIONS_LIMIT);

      if (Array.isArray(data)) {
        setNotifications(data);
        setPage(1);
        setTotalPages(1);
        return;
      }

      const items = data?.items || [];
      const pages = Math.max(Number(data?.pagination?.totalPages) || 1, 1);
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
      await markNotificationRead(id);
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
        onBack={() => router.push("/faculty/dashboard")}
      />
    </SafeAreaView>
  );
}

