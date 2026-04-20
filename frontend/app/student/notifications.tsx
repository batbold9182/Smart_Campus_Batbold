import { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { rootStyles as studentStyles } from "../../styles/rootStyles";
import NotificationFeed, { type NotificationItem } from "../../components/notificationFeed";
import { getNotifications, markNotificationRead } from "../../services/notificationService";

const LIMIT = 6;

type NotificationsPage = {
  items: NotificationItem[];
  totalPages: number;
};

const fetchStudentNotifications = async (page: number): Promise<NotificationsPage> => {
  const data = await getNotifications(page, LIMIT);
  if (Array.isArray(data)) {
    return { items: data, totalPages: 1 };
  }
  return {
    items: data?.items || [],
    totalPages: Math.max(Number(data?.pagination?.totalPages) || 1, 1),
  };
};

export default function NotificationsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["student-notifications", page],
    queryFn: () => fetchStudentNotifications(page),
    placeholderData: (prev) => prev,
  });

  const notifications = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const error = isError ? "Failed to load notifications" : "";

  const markAsRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      // Optimistic update in cache
      queryClient.setQueryData(
        ["student-notifications", page],
        (old: NotificationsPage | undefined) =>
          old
            ? { ...old, items: old.items.map((item) => (item._id === id ? { ...item, isRead: true } : item)) }
            : old
      );
    } catch {
      // silent — badge will correct on next fetch
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={["top"]}>
      <NotificationFeed
        title="Notifications"
        notifications={notifications}
        loading={isLoading}
        error={error}
        page={page}
        totalPages={totalPages}
        styles={studentStyles}
        onRetry={() => queryClient.invalidateQueries({ queryKey: ["student-notifications", page] })}
        onMarkAsRead={markAsRead}
        onPrevious={() => setPage((p) => p - 1)}
        onNext={() => setPage((p) => p + 1)}
        onBack={() => router.push("/student/dashboard")}
      />
    </SafeAreaView>
  );
}
