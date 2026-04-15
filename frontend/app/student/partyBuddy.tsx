import { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import type { Socket } from "socket.io-client";
import { getToken } from "../../services/tokenStorage";
import { getProfile, type AppUserProfile } from "../../services/userService";
import {
  connectPartyBuddySocket,
  getPartyBuddyMessages,
  type PartyBuddyMessage,
  type PartyBuddyPresencePayload,
  type PartyBuddySendAck,
} from "../../services/studentServices/partyBuddyService";
import { AppButton, AppInput } from "../../components/ui";

export default function PartyBuddy() {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);

  const [currentUser, setCurrentUser] = useState<AppUserProfile | null>(null);
  const [messages, setMessages] = useState<PartyBuddyMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [statusLabel, setStatusLabel] = useState("Connecting...");
  const [onlineCount, setOnlineCount] = useState(0);

  const scrollToEnd = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  };

  const appendMessage = (message: PartyBuddyMessage) => {
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
        if (!token) {
          router.replace("/auth/login");
          return;
        }

        const [profile, history] = await Promise.all([
          getProfile(),
          getPartyBuddyMessages(60),
        ]);

        if (!isMounted) return;

        setCurrentUser(profile);
        setMessages(history);

        const socket = await connectPartyBuddySocket(token);
        socketRef.current = socket;

        socket.on("connect", () => {
          if (!isMounted) return;
          getPartyBuddyMessages(100).then((msgs) => {
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
          setError(err.message || "Unable to connect to Party Buddy");
        });

        socket.on("reconnect_failed", () => {
          if (!isMounted) return;
          setStatusLabel("Offline");
          setError("Could not reconnect to Party Buddy. Please reload the page.");
        });

        socket.on("presence:update", (payload: PartyBuddyPresencePayload) => {
          if (!isMounted) return;
          setOnlineCount(payload.onlineCount ?? 0);
        });

        socket.on("message:new", (message: PartyBuddyMessage) => {
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
          "Failed to load Party Buddy"
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

    socket.emit("message:send", { text }, (response: PartyBuddySendAck) => {
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
        <AppButton title="Loading Party Buddy..." loading={true} className="bg-transparent" textClassName="mt-3 text-[15px] text-app-muted" onPress={() => {}} />
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
              <Text className="text-[22px] font-bold text-app-text">🎉 Party Buddy</Text>
              <Text className="mt-1 text-[13px] text-app-muted">
                Plan events, invite friends, and discover social hangouts on campus.
              </Text>
            </View>

            <AppButton
              title="Sections"
              variant="ghost"
              onPress={() => router.back()}
              className="rounded-full bg-app-error-bg px-4 py-2"
              textClassName="font-semibold text-app-danger"
            />
          </View>

          <View className="mt-4 flex-row flex-wrap gap-2">
            <View className="rounded-full bg-app-error-bg px-3 py-2">
              <Text className="text-[12px] font-semibold text-app-danger">{statusLabel}</Text>
            </View>
            <View className="rounded-full bg-app-error-light px-3 py-2">
              <Text className="text-[12px] font-semibold text-app-error-dark">{onlineCount} students online</Text>
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
                Share plans, suggest hangout spots, or find people going to the same event.
              </Text>
            </View>
          ) : null}

          {messages.map((message) => {
            const isMine = message.sender.id === currentUser?._id;

            return (
              <View
                key={message.id}
                className={`max-w-[88%] rounded-2xl px-4 py-3 ${
                  isMine ? "self-end bg-app-danger" : "self-start bg-app-surface"
                }`}
              >
                {!isMine ? (
                  <Text className="mb-1 text-[12px] font-semibold text-app-danger">
                    {message.sender.name}
                    {message.sender.program ? ` • ${message.sender.program}` : ""}
                  </Text>
                ) : null}

                <Text className={isMine ? "text-[15px] leading-6 text-white" : "text-[15px] leading-6 text-app-text"}>
                  {message.text}
                </Text>

                <Text className={`mt-2 text-[11px] ${isMine ? "text-app-error-light" : "text-app-placeholder"}`}>
                  {formatMessageTime(message.createdAt)}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        <View className="border-t border-app-border-light bg-app-surface px-5 pb-5 pt-4">
          <View className="rounded-2xl border border-app-border bg-app-bg-subtle px-4 py-3">
            <AppInput
              multiline
              maxLength={400}
              placeholder="Share plans, suggest a hangout spot..."
              value={draft}
              onChangeText={setDraft}
              className="min-h-[44px] text-[15px] leading-6 text-app-text"
              textAlignVertical="top"
            />
          </View>

          <View className="mt-3 flex-row items-center justify-between">
            <Text className="text-[12px] text-app-muted">{draft.trim().length}/400 characters</Text>

            <AppButton
              title={sending ? "Sending..." : "Send"}
              loading={sending}
              onPress={handleSend}
              className={`rounded-full px-5 py-3 ${
                draft.trim() && !sending && socketRef.current?.connected
                  ? "bg-app-danger"
                  : "bg-app-error-light"
              }`}
              textClassName="font-semibold text-white"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
