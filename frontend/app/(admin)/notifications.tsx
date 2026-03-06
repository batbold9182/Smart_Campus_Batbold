import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Button,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import api from "../../config/clientAPI";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { adminStyles } from "../../styles/adminStyles";
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
        <Button title="Retry" onPress={loadNotifications} />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#f5f7fb]" contentContainerClassName="p-5 pb-6">
      <View className={adminStyles.card}>
        <Text className="mb-5 text-2xl font-bold text-[#111827]">Notifications</Text>

        <View className="mb-[14px] rounded-lg border border-[#ddd] bg-[#fafafa] p-3">
          <Text className="mb-[10px] text-[16px] font-bold text-[#111827]">Send Notification</Text>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Title"
            className="mb-[10px] rounded-md border border-[#ddd] bg-white px-[10px] py-2"
          />

          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Message"
            className="mb-[10px] min-h-[80px] rounded-md border border-[#ddd] bg-white px-[10px] py-2"
            multiline
            textAlignVertical="top"
          />

          <Text className="mb-[6px] text-[14px] text-[#333]">Audience</Text>
          <View className="mb-[10px] rounded-md border border-[#ddd] bg-white">
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
          scrollEnabled={false}
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
        <Button title ="back to dashboard" onPress={() => router.push("../dashboard")} />
      </View>
    </ScrollView>
  );
}


