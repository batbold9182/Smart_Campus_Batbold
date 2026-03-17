import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import api from "../../config/clientAPI";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { adminStyles } from "../../styles/adminStyles";
import NotificationFeed, { NotificationItem } from "../../components/notificationFeed";

export default function NotificationsScreen() {
  const NOTIFICATIONS_LIMIT = 20;
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<"students" | "faculty" | "all">("students");
  const [sending, setSending] = useState(false);
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
      <View className={adminStyles.loadingScreen}>
        <Text className={`mb-3 ${adminStyles.title}`}>Notifications</Text>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className={adminStyles.loadingScreen}>
        <Text className={`mb-3 ${adminStyles.title}`}>Notifications</Text>
        <Text className={adminStyles.errorText}>{error}</Text>
        <TouchableOpacity className={adminStyles.paginationButtonEnabled} onPress={() => loadNotifications(1)}>
          <Text className={adminStyles.buttonPrimaryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const sendForm = (
    <View className={adminStyles.card}>
      <Text className="mb-5 text-2xl font-bold text-app-text">Notifications</Text>

      <View className="mb-[14px] rounded-lg border border-app-border bg-app-bg p-3">
        <Text className="mb-[10px] text-[16px] font-bold text-app-text">Send Notification</Text>

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
          className="mb-[10px] rounded-md border border-app-border bg-app-surface px-[10px] py-2"
        />

        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Message"
          className="mb-[10px] min-h-[80px] rounded-md border border-app-border bg-app-surface px-[10px] py-2"
          multiline
          textAlignVertical="top"
        />

        <Text className="mb-[6px] text-[14px] text-app-text">Audience</Text>
        <View className="mb-[10px] rounded-md border border-app-border bg-app-surface">
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
          <TouchableOpacity className={adminStyles.buttonPrimary} onPress={handleSendNotification}>
            <Text className={adminStyles.buttonPrimaryText}>Send Notification</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <NotificationFeed
      title="Notifications"
      notifications={notifications}
      loading={loading}
      error={error}
      page={page}
      totalPages={totalPages}
      styles={adminStyles}
      onRetry={() => loadNotifications(1)}
      onMarkAsRead={markAsRead}
      onPrevious={() => loadNotifications(page - 1)}
      onNext={() => loadNotifications(page + 1)}
      onBack={() => router.push("../dashboard")}
      backLabel="Back to Dashboard"
      topContent={sendForm}
    />
  );
}


