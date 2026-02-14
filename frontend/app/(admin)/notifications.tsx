import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Button,
  TextInput,
  Alert,
} from "react-native";
import api from "../../config/clientAPI";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";
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
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<"students" | "faculty" | "all">("students");
  const [sending, setSending] = useState(false);
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

  const getRecipientIdsByRole = async (role: "students" | "faculty") => {
    const roleValue = role === "students" ? "student" : "faculty";
    const res = await api.get(`/api/admin/users?role=${roleValue}&page=1&limit=1000`);
    const users = res.data?.users || [];
    return users.map((user: any) => user._id || user.id).filter(Boolean);
  };

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert("Validation", "Please enter title and message");
      return;
    }

    try {
      setSending(true);

      let recipientIds: string[] = [];

      if (audience === "students") {
        recipientIds = await getRecipientIdsByRole("students");
      } else if (audience === "faculty") {
        recipientIds = await getRecipientIdsByRole("faculty");
      } else {
        const [studentIds, facultyIds] = await Promise.all([
          getRecipientIdsByRole("students"),
          getRecipientIdsByRole("faculty"),
        ]);
        recipientIds = [...new Set([...studentIds, ...facultyIds])];
      }

      if (recipientIds.length === 0) {
        Alert.alert("Info", "No recipients found for selected audience");
        return;
      }

      await api.post("/api/admin/notify", {
        title: title.trim(),
        message: message.trim(),
        type: "announcement",
        recipients: recipientIds,
      });

      Alert.alert("Success", `Notification sent to ${recipientIds.length} users`);
      setTitle("");
      setMessage("");
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Failed to send notification";
      Alert.alert("Error", errMsg);
    } finally {
      setSending(false);
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

      <View style={styles.composeCard}>
        <Text style={styles.composeTitle}>Send Notification</Text>

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
          style={styles.input}
        />

        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Message"
          style={[styles.input, styles.messageInput]}
          multiline
        />

        <Text style={styles.audienceLabel}>Audience</Text>
        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={audience}
            onValueChange={(value) => setAudience(value)}
          >
            <Picker.Item label="Students" value="students" />
            <Picker.Item label="Faculty" value="faculty" />
            <Picker.Item label="Students + Faculty" value="all" />
          </Picker>
        </View>

        {sending ? (
          <ActivityIndicator size="small" />
        ) : (
          <Button title="Send Notification" onPress={handleSendNotification} />
        )}
      </View>

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
  composeCard: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    backgroundColor: "#fafafa",
  },
  composeTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  messageInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  audienceLabel: {
    fontSize: 14,
    marginBottom: 6,
    color: "#333",
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    marginBottom: 10,
    backgroundColor: "#fff",
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

