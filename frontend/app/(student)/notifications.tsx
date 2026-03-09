import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import api from "../../config/clientAPI";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

type NotificationItem = {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/api/notifications");
      setNotifications(res.data || []);
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to load notifications";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

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

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#f5f7fb] p-5">
        <Text className="mb-3 text-2xl font-bold text-[#111827]">Notifications</Text>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-[#f5f7fb] p-5">
        <Text className="mb-3 text-2xl font-bold text-[#111827]">Notifications</Text>
        <Text className="mb-[14px] text-[#c62828]">{error}</Text>
        <TouchableOpacity className="rounded-lg bg-blue-500 px-4 py-2" onPress={loadNotifications}>
          <Text className="font-semibold text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f5f7fb]" edges={["top"]}>
      <View className="flex-1 px-5 pb-4">
        <Text className="mb-4 text-[22px] font-bold text-[#111827]">Notifications</Text>

        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={<Text className="mt-5 text-center text-[#666]">No notifications found</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => markAsRead(item._id)}
              className={`mb-[10px] rounded-lg border border-[#ddd] p-3 ${item.isRead ? "bg-[#f5f5f5]" : "bg-[#e3f2fd]"}`}
            >
              <Text className="mb-[6px] text-[16px] font-bold text-[#111827]">{item.title}</Text>
              <Text className="mb-2 text-[14px] text-[#333]">{item.message}</Text>
              <Text className="text-[12px] text-[#666]">{item.isRead ? "Read" : "Tap to mark as read"}</Text>
            </TouchableOpacity>
          )}
        />

        <TouchableOpacity
          className="mt-3 items-center rounded-lg bg-blue-500 p-[14px]"
          onPress={() => router.push("/(student)/dashboard")}
        >
          <Text className="font-semibold text-white">Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

