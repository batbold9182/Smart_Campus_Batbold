import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import api from "../../config/clientAPI";
import { useRouter } from "expo-router";
import { adminStyles } from "../../styles/adminStyles";
import NotificationFeed, { NotificationItem } from "../../components/notificationFeed";

type Audience = "students" | "faculty" | "all" | "specificStudent" | "specificFaculty";

type RecipientOption = {
  id: string;
  name: string;
  email: string;
  identifier: string;
};

type SelectorType = "recipient" | null;

const audienceOptions: { value: Audience; label: string; description: string }[] = [
  { value: "students", label: "Students", description: "Send to all students" },
  { value: "faculty", label: "Faculty", description: "Send to all faculty" },
  { value: "all", label: "Students + Faculty", description: "Send campus-wide" },
  { value: "specificStudent", label: "Specific Student", description: "Choose one student" },
  { value: "specificFaculty", label: "Specific Faculty", description: "Choose one faculty member" },
];

export default function NotificationsScreen() {
  const NOTIFICATIONS_LIMIT = 5;
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<Audience>("students");
  const [recipientOptions, setRecipientOptions] = useState<RecipientOption[]>([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState("");
  const [recipientSearch, setRecipientSearch] = useState("");
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [activeSelector, setActiveSelector] = useState<SelectorType>(null);
  const [sending, setSending] = useState(false);
  const router = useRouter();

  const isSpecificAudience = audience === "specificStudent" || audience === "specificFaculty";
  const selectedRecipient = recipientOptions.find((recipient) => recipient.id === selectedRecipientId) || null;
  const selectedAudienceMeta = audienceOptions.find((option) => option.value === audience);
  const normalizedRecipientSearch = recipientSearch.trim().toLowerCase();
  const filteredRecipientOptions = recipientOptions.filter((recipient) => {
    if (!normalizedRecipientSearch) {
      return true;
    }

    return (
      recipient.name.toLowerCase().includes(normalizedRecipientSearch) ||
      recipient.email.toLowerCase().includes(normalizedRecipientSearch) ||
      recipient.identifier.toLowerCase().includes(normalizedRecipientSearch)
    );
  });

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

  useEffect(() => {
    let isActive = true;

    const loadRecipientOptions = async () => {
      if (!isSpecificAudience) {
        setRecipientOptions([]);
        setSelectedRecipientId("");
        setRecipientSearch("");
        return;
      }

      try {
        setLoadingRecipients(true);
        const role = audience === "specificStudent" ? "student" : "faculty";
        const res = await api.get(`/api/admin/users?role=${role}&page=1&limit=1000`);
        const users = Array.isArray(res.data?.users) ? res.data.users : [];

        if (!isActive) {
          return;
        }

        setRecipientOptions(
          users
            .map((user: any) => ({
              id: user._id || user.id,
              name: user.name || "Unknown user",
              email: user.email || "",
              identifier: user.studentId || user.employeeId || "",
            }))
            .filter((user: RecipientOption) => Boolean(user.id))
        );
        setSelectedRecipientId("");
        setRecipientSearch("");
      } catch {
        if (isActive) {
          setRecipientOptions([]);
          setSelectedRecipientId("");
          setRecipientSearch("");
        }
      } finally {
        if (isActive) {
          setLoadingRecipients(false);
        }
      }
    };

    loadRecipientOptions();

    return () => {
      isActive = false;
    };
  }, [audience, isSpecificAudience]);

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

  const openRecipientSelector = () => {
    if (!loadingRecipients && recipientOptions.length > 0) {
      setRecipientSearch("");
      setActiveSelector("recipient");
    }
  };

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert("Validation", "Please enter title and message");
      return;
    }

    if (isSpecificAudience && !selectedRecipientId) {
      Alert.alert("Validation", "Please select a recipient");
      return;
    }

    try {
      setSending(true);

      let recipientIds: string[] = [];
      let successMessage = "";

      if (audience === "specificStudent" || audience === "specificFaculty") {
        recipientIds = [selectedRecipientId];
        successMessage = selectedRecipient
          ? `Notification sent to ${selectedRecipient.name}`
          : "Notification sent to selected user";
      } else if (audience === "students") {
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

      Alert.alert(
        "Success",
        successMessage || `Notification sent to ${recipientIds.length} users`
      );
      setTitle("");
      setMessage("");
      setSelectedRecipientId("");
      setRecipientSearch("");
      setActiveSelector(null);
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
      <Text className="text-2xl font-bold text-app-text">Notifications</Text>
      <Text className="mb-5 mt-1 text-[13px] text-app-muted">
        Send announcements to all users or target a single faculty member or studentor ID.
      </Text>

      <View className="mb-[14px] rounded-lg border border-app-border bg-app-bg p-3">
        <Text className="mb-[10px] text-[16px] font-bold text-app-text">Send Notification</Text>

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
          placeholderTextColor="#6b7280"
          className="mb-[10px] rounded-md border border-app-border bg-app-surface px-[10px] py-2"
        />

        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Message"
          placeholderTextColor="#6b7280"
          className="mb-[10px] min-h-[80px] rounded-md border border-app-border bg-app-surface px-[10px] py-2"
          multiline
          textAlignVertical="top"
        />

        <Text className="mb-[6px] text-[14px] text-app-text">Audience</Text>
        <View className="mb-[10px] flex-row flex-wrap gap-2">
          {audienceOptions.map((option) => {
            const isActive = audience === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                className={`min-w-[48%] flex-1 rounded-xl border px-3 py-3 ${
                  isActive
                    ? "border-blue-500 bg-[#dbeafe]"
                    : "border-app-border bg-app-surface"
                }`}
                onPress={() => setAudience(option.value)}
              >
                <Text className={`text-[14px] font-semibold ${isActive ? "text-blue-700" : "text-app-text"}`}>
                  {option.label}
                </Text>
                <Text className={`mt-1 text-[12px] ${isActive ? "text-blue-700" : "text-app-muted"}`}>
                  {option.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="mb-[10px] rounded-xl border border-app-border bg-app-surface px-3 py-3">
          <Text className="text-[12px] uppercase tracking-[0.6px] text-app-muted">Current Audience</Text>
          <Text className="mt-1 text-[15px] font-semibold text-app-text">{selectedAudienceMeta?.label}</Text>
          <Text className="mt-1 text-[13px] text-app-muted">{selectedAudienceMeta?.description}</Text>
        </View>

        {isSpecificAudience ? (
          <View className="mb-[10px]">
            <Text className="mb-[6px] text-[14px] text-app-text">Recipient</Text>
            {loadingRecipients ? (
              <View className="rounded-xl border border-app-border bg-app-surface px-3 py-4">
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator size="small" />
                  <Text className="text-[14px] text-app-muted">Loading recipients...</Text>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                className="rounded-xl border border-app-border bg-app-surface px-3 py-4"
                onPress={openRecipientSelector}
                disabled={recipientOptions.length === 0}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 pr-3">
                    <Text className="text-[12px] uppercase tracking-[0.6px] text-app-muted">Selected Recipient</Text>
                    <Text className={`mt-1 text-[15px] font-semibold ${selectedRecipient ? "text-app-text" : "text-app-muted"}`}>
                      {selectedRecipient ? selectedRecipient.name : "Tap to choose a recipient"}
                    </Text>
                    <Text className="mt-1 text-[13px] text-app-muted">
                      {selectedRecipient
                        ? [selectedRecipient.email, selectedRecipient.identifier].filter(Boolean).join(" • ")
                        : "Opens a list of matching users"}
                    </Text>
                  </View>
                  <Text className="text-[18px] text-app-muted">▾</Text>
                </View>
              </TouchableOpacity>
            )}
            {!loadingRecipients && recipientOptions.length === 0 ? (
              <Text className="mt-[6px] text-[12px] text-app-muted">
                No users found for this audience.
              </Text>
            ) : null}
          </View>
        ) : null}

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
    <>
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

      <Modal
        transparent
        visible={activeSelector === "recipient"}
        animationType="fade"
        onRequestClose={() => setActiveSelector(null)}
      >
        <Pressable
          className="flex-1 items-center justify-end bg-black/40 px-4 pb-6"
          onPress={() => setActiveSelector(null)}
        >
          <Pressable className="max-h-[70%] w-full rounded-2xl bg-white p-4" onPress={() => {}}>
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-[17px] font-bold text-[#0f172a]">Select Recipient</Text>
              <TouchableOpacity onPress={() => setActiveSelector(null)}>
                <Text className="text-[14px] font-semibold text-[#2563eb]">Done</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              value={recipientSearch}
              onChangeText={setRecipientSearch}
              placeholder="Search by name, email, ID"
              placeholderTextColor="#6b7280"
              className="mb-3 rounded-xl border border-app-border bg-app-surface px-3 py-3 text-[15px] text-app-text"
            />
            <Text className="mb-3 text-[12px] text-app-muted">
              {filteredRecipientOptions.length} result{filteredRecipientOptions.length === 1 ? "" : "s"}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {filteredRecipientOptions.length === 0 ? (
                <View className="rounded-xl border border-dashed border-app-border bg-app-surface px-4 py-5">
                  <Text className="text-center text-[14px] text-app-muted">
                    No recipients match your search.
                  </Text>
                </View>
              ) : filteredRecipientOptions.map((recipient) => {
                const active = recipient.id === selectedRecipientId;
                return (
                  <TouchableOpacity
                    key={recipient.id}
                    className={`mb-2 rounded-lg border px-3 py-3 ${
                      active ? "border-[#2563eb] bg-[#eff6ff]" : "border-[#e5e7eb] bg-white"
                    }`}
                    onPress={() => {
                      setSelectedRecipientId(recipient.id);
                      setActiveSelector(null);
                    }}
                  >
                    <Text className={`font-medium ${active ? "text-[#1d4ed8]" : "text-[#111827]"}`}>
                      {recipient.name}
                    </Text>
                    <Text className={`mt-1 text-[13px] ${active ? "text-[#1d4ed8]" : "text-[#64748b]"}`}>
                      {recipient.email}
                    </Text>
                    {recipient.identifier ? (
                      <Text className={`mt-1 text-[12px] ${active ? "text-[#1d4ed8]" : "text-[#64748b]"}`}>
                        ID: {recipient.identifier}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}


