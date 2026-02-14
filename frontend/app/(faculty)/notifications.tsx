import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Button,
} from "react-native";
import api from "../../config/clientAPI";
import { useRouter } from "expo-router";
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
      <View style={[styles.container, styles.center]}>
        <Text style={styles.title}>Notifications</Text>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Retry" onPress={loadNotifications} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={<Text style={styles.emptyText}>No notifications found</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => markAsRead(item._id)}
            style={[styles.card, item.isRead ? styles.readCard : styles.unreadCard]}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMessage}>{item.message}</Text>
            <Text style={styles.cardMeta}>{item.isRead ? "Read" : "Tap to mark as read"}</Text>
          </TouchableOpacity>
        )}
      />
      <Button title ="back to dashboard" onPress={() => router.push("../dashboard")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  errorText: {
    color: "#c62828",
    marginBottom: 14,
  },
  emptyText: {
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  unreadCard: {
    backgroundColor: "#e3f2fd",
  },
  readCard: {
    backgroundColor: "#f5f5f5",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  cardMessage: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  cardMeta: {
    fontSize: 12,
    color: "#666",
  },
});

