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
import { Socket } from "socket.io-client";
import { getToken } from "../../services/tokenStorage";
import { getProfile, type AppUserProfile } from "../../services/userService";
import {
  connectPartyBuddySocket,
  getPartyBuddyMessages,
  type PartyBuddyMessage,
  type PartyBuddyPresencePayload,
  type PartyBuddySendAck,
} from "../../services/studentServices/partyBuddyService";

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
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 50);
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

    const init = async () => {
      try {
        const token = await getToken();

        const [profile, history] = await Promise.all([
          getProfile(),
          getPartyBuddyMessages(60),
        ]);

        if (!isMounted) return;

        setCurrentUser(profile);
        setMessages(history);

        const socket = connectPartyBuddySocket(token);
        socketRef.current = socket;

        socket.on("connect", () => {
          if (!isMounted) return;
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

        socket.on("presence:update", (payload: PartyBuddyPresencePayload) => {
          if (!isMounted) return;
          setOnlineCount(payload.onlineCount ?? 0);
        });

        socket.on("message:new", (message: PartyBuddyMessage) => {
          if (!isMounted) return;
          appendMessage(message);
          scrollToEnd();
        });

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
      <SafeAreaView className="flex-1 items-center justify-center bg-[#f5f7fb]" edges={["top"]}>
        <ActivityIndicator size="large" color="#dc2626" />
        <Text className="mt-3 text-[15px] text-[#6b7280]">Loading Party Buddy...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f5f7fb]" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="border-b border-[#e5e7eb] bg-white px-5 pb-4 pt-2">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-[22px] font-bold text-[#111827]">🎉 Party Buddy</Text>
              <Text className="mt-1 text-[13px] text-[#6b7280]">
                Plan events, invite friends, and discover social hangouts on campus.
              </Text>
            </View>

            <TouchableOpacity
              className="rounded-full bg-[#fee2e2] px-4 py-2"
              onPress={() => router.back()}
            >
              <Text className="font-semibold text-[#dc2626]">Sections</Text>
            </TouchableOpacity>
          </View>

          <View className="mt-4 flex-row flex-wrap gap-2">
            <View className="rounded-full bg-[#fee2e2] px-3 py-2">
              <Text className="text-[12px] font-semibold text-[#dc2626]">{statusLabel}</Text>
            </View>
            <View className="rounded-full bg-[#fecaca] px-3 py-2">
              <Text className="text-[12px] font-semibold text-[#991b1b]">{onlineCount} students online</Text>
            </View>
            {currentUser?.program ? (
              <View className="rounded-full bg-[#f3f4f6] px-3 py-2">
                <Text className="text-[12px] font-semibold text-[#374151]">{currentUser.program}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {error ? (
          <View className="mx-5 mt-4 rounded-xl border border-[#fecaca] bg-[#fef2f2] p-4">
            <Text className="font-semibold text-[#991b1b]">Connection issue</Text>
            <Text className="mt-1 text-[#b91c1c]">{error}</Text>
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
            <View className="mt-10 rounded-2xl bg-white p-5 shadow-sm">
              <Text className="text-[16px] font-semibold text-[#111827]">Start the conversation</Text>
              <Text className="mt-2 leading-6 text-[#6b7280]">
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
                  isMine ? "self-end bg-[#dc2626]" : "self-start bg-white"
                }`}
              >
                {!isMine ? (
                  <Text className="mb-1 text-[12px] font-semibold text-[#dc2626]">
                    {message.sender.name}
                    {message.sender.program ? ` • ${message.sender.program}` : ""}
                  </Text>
                ) : null}

                <Text className={isMine ? "text-[15px] leading-6 text-white" : "text-[15px] leading-6 text-[#111827]"}>
                  {message.text}
                </Text>

                <Text className={`mt-2 text-[11px] ${isMine ? "text-[#fecaca]" : "text-[#9ca3af]"}`}>
                  {formatMessageTime(message.createdAt)}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        <View className="border-t border-[#e5e7eb] bg-white px-5 pb-5 pt-4">
          <View className="rounded-2xl border border-[#d1d5db] bg-[#f9fafb] px-4 py-3">
            <TextInput
              multiline
              maxLength={400}
              placeholder="Share plans, suggest a hangout spot..."
              placeholderTextColor="#9ca3af"
              value={draft}
              onChangeText={setDraft}
              className="min-h-[44px] text-[15px] leading-6 text-[#111827]"
              textAlignVertical="top"
            />
          </View>

          <View className="mt-3 flex-row items-center justify-between">
            <Text className="text-[12px] text-[#6b7280]">{draft.trim().length}/400 characters</Text>

            <TouchableOpacity
              className={`rounded-full px-5 py-3 ${
                draft.trim() && !sending && socketRef.current?.connected
                  ? "bg-[#dc2626]"
                  : "bg-[#fecaca]"
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
