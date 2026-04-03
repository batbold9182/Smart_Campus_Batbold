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
  connectLunchBuddySocket,
  getLunchBuddyMessages,
  type LunchBuddyMessage,
  type LunchBuddyPresencePayload,
  type LunchBuddySendAck,
} from "../../services/studentServices/lunchBuddyService";

type BuddySection = "hub" | "lunch";
type BuddySectionKey = "lunch" | "learning" | "party";

const buddySections: {
  key: BuddySectionKey;
  title: string;
  icon: string;
  description: string;
  accentClassName: string;
  badgeLabel: string;
}[] = [
  {
    key: "lunch",
    title: "Lunch Buddy",
    icon: "🍜",
    description: "Find students who are free to eat now and chat in real time.",
    accentClassName: "bg-[#dbeafe]",
    badgeLabel: "Live",
  },
  {
    key: "learning",
    title: "Learning Buddy",
    icon: "📘",
    description: "Meet classmates for review sessions, study groups, and exam prep.",
    accentClassName: "bg-[#dcfce7]",
    badgeLabel: "Live",
  },
  {
    key: "party",
    title: "Party Buddy",
    icon: "🎉",
    description: "Plan events, invite friends, and discover social hangouts on campus.",
    accentClassName: "bg-[#fee2e2]",
    badgeLabel: "Live",
  },
];

export default function VizjaFriends() {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);

  const [currentUser, setCurrentUser] = useState<AppUserProfile | null>(null);
  const [authToken, setAuthToken] = useState("");
  const [selectedSection, setSelectedSection] = useState<BuddySection>("hub");
  const [messages, setMessages] = useState<LunchBuddyMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [statusLabel, setStatusLabel] = useState("Choose a room");
  const [onlineCount, setOnlineCount] = useState(0);

  const scrollToEnd = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 50);
  };

  const appendMessage = (message: LunchBuddyMessage) => {
    setMessages((currentMessages) => {
      if (currentMessages.some((item) => item.id === message.id)) {
        return currentMessages;
      }

      return [...currentMessages, message];
    });
  };

  const formatMessageTime = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    let isMounted = true;

    const loadBaseState = async () => {
      try {
        const token = await getToken();

        const profile = await getProfile();

        if (!isMounted) {
          return;
        }

        setAuthToken(token ?? "");
        setCurrentUser(profile);
        setLoading(false);
      } catch (loadError: any) {
        if (!isMounted) {
          return;
        }

        const message =
          loadError?.response?.data?.message ||
          loadError?.message ||
          "Failed to load Vizja Friends";

        setError(message);
        setStatusLabel("Offline");
        setLoading(false);
      }
    };

    loadBaseState();

    return () => {
      isMounted = false;
    };
  }, [router]);

  useEffect(() => {
    if (selectedSection !== "lunch" || !authToken) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSending(false);
      setOnlineCount(0);
      setDraft("");
      setError("");
      setStatusLabel("Choose a room");
      return;
    }

    let isMounted = true;
    setChatLoading(true);
    setStatusLabel("Connecting...");
    setError("");

    const initializeLunchBuddy = async () => {
      try {
        const history = await getLunchBuddyMessages(60);

        if (!isMounted) {
          return;
        }

        setMessages(history);

        const socket = await connectLunchBuddySocket(authToken);
        socketRef.current = socket;

        socket.on("connect", () => {
          if (!isMounted) {
            return;
          }

          setStatusLabel("Live");
          setError("");
        });

        socket.on("disconnect", () => {
          if (!isMounted) {
            return;
          }

          setStatusLabel("Reconnecting...");
        });

        socket.on("connect_error", (socketError) => {
          if (!isMounted) {
            return;
          }

          setStatusLabel("Offline");
          setError(socketError.message || "Unable to connect to Lunch Buddy");
        });

        socket.on("presence:update", (payload: LunchBuddyPresencePayload) => {
          if (!isMounted) {
            return;
          }

          setOnlineCount(payload.onlineCount ?? 0);
        });

        socket.on("message:new", (message: LunchBuddyMessage) => {
          if (!isMounted) {
            return;
          }

          appendMessage(message);
          scrollToEnd();
        });

        setChatLoading(false);
        scrollToEnd();
      } catch (loadError: any) {
        if (!isMounted) {
          return;
        }

        const message =
          loadError?.response?.data?.message ||
          loadError?.message ||
          "Failed to load Lunch Buddy";

        setError(message);
        setStatusLabel("Offline");
        setChatLoading(false);
      }
    };

    initializeLunchBuddy();

    return () => {
      isMounted = false;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [authToken, selectedSection]);

  const handleSend = () => {
    const text = draft.trim();
    const socket = socketRef.current;

    if (!text || !socket) {
      return;
    }

    if (text.length > 400) {
      Alert.alert("Message too long", "Keep each message under 400 characters.");
      return;
    }

    setSending(true);

    socket.emit("message:send", { text }, (response: LunchBuddySendAck) => {
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
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-3 text-[15px] text-[#6b7280]">Loading Vizja Friends...</Text>
      </SafeAreaView>
    );
  }

  const headerTitle = selectedSection === "hub" ? "Vizja Friends" : "Lunch Buddy";
  const headerDescription = selectedSection === "hub"
    ? "Choose a section for campus friendships, study partners, and social plans."
    : "Student-only live chat for finding lunch company on campus.";

  const selectedSectionMeta = buddySections.find((section) => section.key === selectedSection);

  return (
    <SafeAreaView className="flex-1 bg-[#f5f7fb]" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="border-b border-[#e5e7eb] bg-white px-5 pb-4 pt-2">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-[22px] font-bold text-[#111827]">{headerTitle}</Text>
              <Text className="mt-1 text-[13px] text-[#6b7280]">
                {headerDescription}
              </Text>
            </View>

            <TouchableOpacity
              className="rounded-full bg-[#e0ecff] px-4 py-2"
              onPress={() => {
                if (selectedSection === "hub") {
                  router.push("/student/dashboard");
                  return;
                }

                setSelectedSection("hub");
              }}
            >
              <Text className="font-semibold text-[#1d4ed8]">{selectedSection === "hub" ? "Back" : "Sections"}</Text>
            </TouchableOpacity>
          </View>

          <View className="mt-4 flex-row flex-wrap gap-2">
            {selectedSectionMeta ? (
              <View className={`rounded-full px-3 py-2 ${selectedSectionMeta.accentClassName}`}>
                <Text className="text-[12px] font-semibold text-[#1f2937]">{selectedSectionMeta.badgeLabel}</Text>
              </View>
            ) : null}
            <View className="rounded-full bg-[#dcfce7] px-3 py-2">
              <Text className="text-[12px] font-semibold text-[#166534]">{statusLabel}</Text>
            </View>
            {selectedSection === "lunch" ? (
              <View className="rounded-full bg-[#e0ecff] px-3 py-2">
                <Text className="text-[12px] font-semibold text-[#1d4ed8]">{onlineCount} students online</Text>
              </View>
            ) : null}
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

        {selectedSection === "hub" ? (
          <ScrollView
            className="flex-1 px-5"
            contentContainerClassName="gap-4 pb-8 pt-5"
            showsVerticalScrollIndicator={false}
          >
            <View className="rounded-[28px] bg-[#111827] p-5">
              <Text className="text-[12px] font-semibold uppercase tracking-[1px] text-[#93c5fd]">Student spaces</Text>
              <Text className="mt-2 text-[24px] font-bold text-white">Choose your vibe</Text>
              <Text className="mt-2 leading-6 text-[#d1d5db]">
                Vizja Friends separates social chat into focused sections, so students can join the right conversation instead of one noisy room.
              </Text>
            </View>

            {buddySections.map((section) => (
              <TouchableOpacity
                key={section.key}
                className="rounded-[26px] bg-white p-5 shadow-sm"
                onPress={() => {
                  if (section.key === "lunch") {
                    setSelectedSection("lunch");
                  } else if (section.key === "learning") {
                    router.push("/student/learningBuddy");
                  } else {
                    router.push("/student/partyBuddy");
                  }
                }}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 pr-4">
                    <Text className="text-[28px]">{section.icon}</Text>
                    <Text className="mt-3 text-[20px] font-bold text-[#111827]">{section.title}</Text>
                    <Text className="mt-2 leading-6 text-[#6b7280]">{section.description}</Text>
                  </View>
                  <View className={`rounded-full px-3 py-2 ${section.accentClassName}`}>
                    <Text className="text-[12px] font-semibold text-[#1f2937]">{section.badgeLabel}</Text>
                  </View>
                </View>

                <View className="mt-5 flex-row items-center justify-between border-t border-[#f3f4f6] pt-4">
                  <Text className="text-[13px] font-semibold text-[#1d4ed8]">Open section</Text>
                  <Text className="text-[18px] text-[#9ca3af]">→</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <>
            {chatLoading ? (
              <View className="flex-1 items-center justify-center px-5">
                <ActivityIndicator size="large" color="#2563eb" />
                <Text className="mt-3 text-[15px] text-[#6b7280]">Connecting to Lunch Buddy...</Text>
              </View>
            ) : (
              <>
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
                        Ask who is free for lunch, suggest a cafe, or find classmates nearby.
                      </Text>
                    </View>
                  ) : null}

                  {messages.map((message) => {
                    const isMine = message.sender.id === currentUser?._id;

                    return (
                      <View
                        key={message.id}
                        className={`max-w-[88%] rounded-2xl px-4 py-3 ${
                          isMine ? "self-end bg-[#2563eb]" : "self-start bg-white"
                        }`}
                      >
                        {!isMine ? (
                          <Text className="mb-1 text-[12px] font-semibold text-[#1d4ed8]">
                            {message.sender.name}
                            {message.sender.program ? ` • ${message.sender.program}` : ""}
                          </Text>
                        ) : null}

                        <Text className={isMine ? "text-[15px] leading-6 text-white" : "text-[15px] leading-6 text-[#111827]"}>
                          {message.text}
                        </Text>

                        <Text className={`mt-2 text-[11px] ${isMine ? "text-[#dbeafe]" : "text-[#9ca3af]"}`}>
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
                      placeholder="Ask who wants to grab lunch..."
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
                          ? "bg-[#2563eb]"
                          : "bg-[#bfdbfe]"
                      }`}
                      disabled={!draft.trim() || sending || !socketRef.current?.connected}
                      onPress={handleSend}
                    >
                      <Text className="font-semibold text-white">{sending ? "Sending..." : "Send"}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
