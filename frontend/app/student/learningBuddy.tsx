import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import type { Socket } from "socket.io-client";
import { getToken } from "../../services/tokenStorage";
import { getProfile, type AppUserProfile } from "../../services/userService";
import {
  connectLearningBuddySocket,
  getLearningBuddyMessages,
  type LearningBuddyMessage,
  type LearningBuddyPresencePayload,
  type LearningBuddySendAck,
} from "../../services/studentServices/learningBuddyService";

export default function LearningBuddy() {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);

  const [currentUser, setCurrentUser] = useState<AppUserProfile | null>(null);
  const [messages, setMessages] = useState<LearningBuddyMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [statusLabel, setStatusLabel] = useState("Connecting...");
  const [onlineCount, setOnlineCount] = useState(0);

  const scrollToEnd = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 50);
  };

  const appendMessage = (message: LearningBuddyMessage) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev;
      return [...prev, message];
    });
  };

  const formatMessageTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  useEffect(() => {
    let isMounted = true;

    const handleVisibilityChange = () => {
      if (typeof document === "undefined") return;
      if (document.visibilityState === "hidden") {
        socketRef.current?.disconnect();
      } else {
        socketRef.current?.connect();
      }
    };

    const init = async () => {
      try {
        const token = await getToken();

        const [profile, history] = await Promise.all([
          getProfile(),
          getLearningBuddyMessages(60),
        ]);

        if (!isMounted) return;

        setCurrentUser(profile);
        setMessages(history);

        const socket = await connectLearningBuddySocket(token ?? "");
        socketRef.current = socket;

        socket.on("connect", () => {
          if (!isMounted) return;
          getLearningBuddyMessages(100).then((msgs) => {
            if (isMounted) setMessages(msgs);
          });
          setStatusLabel("Live");
          setError("");
        });

        socket.on("disconnect", () => {
          if (!isMounted) return;
          setStatusLabel("Reconnecting...");
        });

        socket.on("connect_error", (err) => {
          if (!isMounted) return;
          setStatusLabel("Offline");
          setError(err.message || "Unable to connect to Learning Buddy");
        });

        socket.on("presence:update", (payload: LearningBuddyPresencePayload) => {
          if (!isMounted) return;
          setOnlineCount(payload.onlineCount ?? 0);
        });

        socket.on("message:new", (message: LearningBuddyMessage) => {
          if (!isMounted) return;
          appendMessage(message);
          scrollToEnd();
        });

        if (typeof document !== "undefined") {
          document.addEventListener("visibilitychange", handleVisibilityChange);
        }

        setLoading(false);
        scrollToEnd();
      } catch (loadError: any) {
        if (!isMounted) return;
        setError(
          loadError?.response?.data?.message ||
          loadError?.message ||
          "Failed to load Learning Buddy"
        );
        setStatusLabel("Offline");
        setLoading(false);
      }
    };

    init();

    return () => {
      isMounted = false;
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [router]);

  const handleSend = () => {
    const text = draft.trim();
    const socket = socketRef.current;

    if (!text || !socket) return;

    if (text.length > 400) {
      Alert.alert("Message too long", "Keep messages under 400 characters.");
      return;
    }

    setSending(true);

    socket.emit("message:send", { text }, (response: LearningBuddySendAck) => {
      setSending(false);
      if (response?.ok) {
        setDraft("");
        return;
      }
      Alert.alert("Unable to send", response?.error || "Please try again.");
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-app-bg" edges={["top"]}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text className="mt-3 text-[15px] text-app-muted">Loading Learning Buddy...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="border-b border-app-border-light bg-app-surface px-5 pb-4 pt-2">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-[22px] font-bold text-app-text">📘 Learning Buddy</Text>
              <Text className="mt-1 text-[13px] text-app-muted">
                Study partners, revision circles, and assignment help.
              </Text>
            </View>

            <TouchableOpacity
              className="rounded-full bg-app-success-light px-4 py-2"
              onPress={() => router.back()}
            >
              <Text className="font-semibold text-app-success-dark">Sections</Text>
            </TouchableOpacity>
          </View>

          <View className="mt-4 flex-row flex-wrap gap-2">
            <View className="rounded-full bg-app-success-light px-3 py-2">
              <Text className="text-[12px] font-semibold text-app-success-dark">{statusLabel}</Text>
            </View>
            <View className="rounded-full bg-app-success-bg px-3 py-2">
              <Text className="text-[12px] font-semibold text-app-success">{onlineCount} students online</Text>
            </View>
            {currentUser?.program ? (
              <View className="rounded-full bg-app-bg-muted px-3 py-2">
                <Text className="text-[12px] font-semibold text-app-text-secondary">{currentUser.program}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {error ? (
          <View className="mx-5 mt-4 rounded-xl border border-app-error-light bg-app-error-bg-subtle p-4">
            <Text className="font-semibold text-app-error-dark">Connection issue</Text>
            <Text className="mt-1 text-app-error">{error}</Text>
          </View>
        ) : null}

        <ScrollView
          ref={scrollRef}
          className="flex-1 px-5"
          contentContainerClassName="gap-3 pb-6 pt-4"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToEnd}
        >
          {messages.length === 0 ? (
            <View className="mt-10 rounded-2xl bg-app-surface p-5 shadow-sm">
              <Text className="text-[16px] font-semibold text-app-text">Start the conversation</Text>
              <Text className="mt-2 leading-6 text-app-muted">
                Ask about an assignment, form a study group, or find classmates reviewing for the same exam.
              </Text>
            </View>
          ) : null}

          {messages.map((message) => {
            const isMine = message.sender.id === currentUser?._id;

            return (
              <View
                key={message.id}
                className={`max-w-[88%] rounded-2xl px-4 py-3 ${
                  isMine ? "self-end bg-app-success-accent" : "self-start bg-app-surface"
                }`}
              >
                {!isMine ? (
                  <Text className="mb-1 text-[12px] font-semibold text-app-success-accent">
                    {message.sender.name}
                    {message.sender.program ? ` • ${message.sender.program}` : ""}
                  </Text>
                ) : null}

                <Text className={isMine ? "text-[15px] leading-6 text-white" : "text-[15px] leading-6 text-app-text"}>
                  {message.text}
                </Text>

                <Text className={`mt-2 text-[11px] ${isMine ? "text-app-success-timestamp" : "text-app-placeholder"}`}>
                  {formatMessageTime(message.createdAt)}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        <View className="border-t border-app-border-light bg-app-surface px-5 pb-5 pt-4">
          <View className="rounded-2xl border border-app-border bg-app-bg-subtle px-4 py-3">
            <TextInput
              multiline
              maxLength={400}
              placeholder="Ask about a topic, form a study group..."
              placeholderTextColor="#9ca3af"
              value={draft}
              onChangeText={setDraft}
              className="min-h-[44px] text-[15px] leading-6 text-app-text"
              textAlignVertical="top"
            />
          </View>

          <View className="mt-3 flex-row items-center justify-between">
            <Text className="text-[12px] text-app-muted">{draft.trim().length}/400 characters</Text>

            <TouchableOpacity
              className={`rounded-full px-5 py-3 ${
                draft.trim() && !sending && socketRef.current?.connected
                  ? "bg-app-success-accent"
                  : "bg-app-success-timestamp"
              }`}
              disabled={!draft.trim() || sending || !socketRef.current?.connected}
              onPress={handleSend}
            >
              <Text className="font-semibold text-white">{sending ? "Sending..." : "Send"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
