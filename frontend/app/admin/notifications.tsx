import { useEffect, useState } from "react";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import { adminStyles } from "../../styles/adminStyles";
import { NotificationItem } from "../../components/notificationFeed";
import NotificationFeed from "../../components/notificationFeed";
import NotificationForm, {
  type Audience,
  type RecipientOption,
} from "../../components/admin/NotificationForm";
import RecipientPickerModal from "../../components/admin/RecipientPickerModal";
import {
  getNotifications,
  markNotificationRead,
  getUsersByRole,
  sendNotification,
} from "../../services/notificationService";

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
  const [recipientModalOpen, setRecipientModalOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const router = useRouter();

  const isSpecificAudience = audience === "specificStudent" || audience === "specificFaculty";
  const selectedRecipient = recipientOptions.find((r) => r.id === selectedRecipientId) || null;
  const normalizedSearch = recipientSearch.trim().toLowerCase();
  const filteredRecipientOptions = recipientOptions.filter((r) => {
    if (!normalizedSearch) return true;
    return (
      r.name.toLowerCase().includes(normalizedSearch) ||
      r.email.toLowerCase().includes(normalizedSearch) ||
      r.identifier.toLowerCase().includes(normalizedSearch)
    );
  });

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
      setError(err.response?.data?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications(1);
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadRecipients = async () => {
      if (!isSpecificAudience) {
        setRecipientOptions([]);
        setSelectedRecipientId("");
        setRecipientSearch("");
        return;
      }

      try {
        setLoadingRecipients(true);
        const role = audience === "specificStudent" ? "student" : "faculty";
        const data = await getUsersByRole(role);
        const users = Array.isArray(data?.users) ? data.users : [];

        if (!isActive) return;

        setRecipientOptions(
          users
            .map((u: any) => ({
              id: u._id || u.id,
              name: u.name || "Unknown user",
              email: u.email || "",
              identifier: u.studentId || u.employeeId || "",
            }))
            .filter((u: RecipientOption) => Boolean(u.id))
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
        if (isActive) setLoadingRecipients(false);
      }
    };

    loadRecipients();
    return () => { isActive = false; };
  }, [audience, isSpecificAudience]);

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

  const getRecipientIdsByRole = async (role: "students" | "faculty") => {
    const data = await getUsersByRole(role === "students" ? "student" : "faculty");
    return (data?.users || []).map((u: any) => u._id || u.id).filter(Boolean);
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
        const [s, f] = await Promise.all([
          getRecipientIdsByRole("students"),
          getRecipientIdsByRole("faculty"),
        ]);
        recipientIds = [...new Set([...s, ...f])];
      }

      if (recipientIds.length === 0) {
        Alert.alert("Info", "No recipients found for selected audience");
        return;
      }

      await sendNotification({
        title: title.trim().replace(/<[^>]*>/g, ""),
        message: message.trim().replace(/<[^>]*>/g, ""),
        type: "announcement",
        recipients: recipientIds,
      });

      Toast.show({ type: "success", text1: successMessage || `Notification sent to ${recipientIds.length} users` });
      setTitle("");
      setMessage("");
      setSelectedRecipientId("");
      setRecipientSearch("");
      setRecipientModalOpen(false);
    } catch (err: any) {
      Toast.show({ type: "error", text1: err.response?.data?.message || "Failed to send notification" });
    } finally {
      setSending(false);
    }
  };

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
        onBack={() => router.push("/admin/dashboard")}
        backLabel="Back to Dashboard"
        topContent={
          <NotificationForm
            title={title}
            setTitle={setTitle}
            message={message}
            setMessage={setMessage}
            audience={audience}
            setAudience={setAudience}
            sending={sending}
            onSend={handleSendNotification}
            isSpecificAudience={isSpecificAudience}
            selectedRecipient={selectedRecipient}
            loadingRecipients={loadingRecipients}
            recipientOptions={recipientOptions}
            onOpenRecipientSelector={() => {
              if (!loadingRecipients && recipientOptions.length > 0) {
                setRecipientSearch("");
                setRecipientModalOpen(true);
              }
            }}
            styles={adminStyles}
          />
        }
      />

      <RecipientPickerModal
        open={recipientModalOpen}
        onClose={() => setRecipientModalOpen(false)}
        recipientSearch={recipientSearch}
        setRecipientSearch={setRecipientSearch}
        filteredOptions={filteredRecipientOptions}
        selectedRecipientId={selectedRecipientId}
        onSelect={(id) => {
          setSelectedRecipientId(id);
          setRecipientModalOpen(false);
        }}
      />
    </>
  );
}
