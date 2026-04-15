import { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
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
import { AppButton, AppInput } from "../../components/ui";

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
    icon: "??",
    description: "Find students who are free to eat now and chat in real time.",
    accentClassName: "bg-app-primary-light",
    badgeLabel: "Live",
  },
  {
    key: "learning",
    title: "Learning Buddy",
    icon: "??",
    description: "Meet classmates for review sessions, study groups, and exam prep.",
    accentClassName: "bg-app-success-light",
    badgeLabel: "Live",
  },
  {
    key: "party",
    title: "Party Buddy",
    icon: "??",
    description: "Plan events, invite friends, and discover social hangouts on campus.",
    accentClassName: "bg-app-error-bg",
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
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
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

    const handleVisibilityChange = () => {
      if (typeof document === "undefined") return;
      if (document.visibilityState === "hidden") {
        socketRef.current?.disconnect();
      } else {
        socketRef.current?.connect();
      }
    };

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

          getLunchBuddyMessages(100).then((msgs) => {
            if (isMounted) setMessages(msgs);
          });
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

        if (typeof document !== "undefined") {
          document.addEventListener("visibilitychange", handleVisibilityChange);
        }

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
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
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
      <SafeAreaView className="flex-1 items-center justify-center bg-app-bg" edges={["top"]}>
        <AppButton title="Loading Vizja Friends..." loading={true} className="bg-transparent" textClassName="mt-3 text-[15px] text-app-muted" onPress={() => {}} />
      </SafeAreaView>
    );
  }

  const headerTitle = selectedSection === "hub" ? "Vizja Friends" : "Lunch Buddy";
  const headerDescription = selectedSection === "hub"
    ? "Choose a section for campus friendships, study partners, and social plans."
    : "Student-only live chat for finding lunch company on campus.";

  const selectedSectionMeta = buddySections.find((section) => section.key === selectedSection);

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="border-b border-app-border-light bg-app-surface px-5 pb-4 pt-2">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-[22px] font-bold text-app-text">{headerTitle}</Text>
              <Text className="mt-1 text-[13px] text-app-muted">
                {headerDescription}
              </Text>
            </View>

            <AppButton
              title={selectedSection === "hub" ? "Back" : "Sections"}
              variant="ghost"
              onPress={() => {
                if (selectedSection === "hub") {
                  router.push("/student/dashboard");
                  return;
                }

                setSelectedSection("hub");
              }}
              className="rounded-full bg-app-primary-light px-4 py-2"
              textClassName="font-semibold text-app-primary-dark"
            />
          </View>

          <View className="mt-4 flex-row flex-wrap gap-2">
            {selectedSectionMeta ? (
              <View className={`rounded-full px-3 py-2 ${selectedSectionMeta.accentClassName}`}>
                <Text className="text-[12px] font-semibold text-app-text">{selectedSectionMeta.badgeLabel}</Text>
              </View>
            ) : null}
            <View className="rounded-full bg-app-success-light px-3 py-2">
              <Text className="text-[12px] font-semibold text-app-success-dark">{statusLabel}</Text>
            </View>
            {selectedSection === "lunch" ? (
              <View className="rounded-full bg-app-primary-light px-3 py-2">
                <Text className="text-[12px] font-semibold text-app-primary-dark">{onlineCount} students online</Text>
              </View>
            ) : null}
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

        {selectedSection === "hub" ? (
          <ScrollView
            className="flex-1 px-5"
            contentContainerClassName="gap-4 pb-8 pt-5"
            showsVerticalScrollIndicator={false}
          >
            <View className="rounded-[28px] bg-app-text p-5">
              <Text className="text-[12px] font-semibold uppercase tracking-[1px] text-app-primary-loading">Student spaces</Text>
              <Text className="mt-2 text-[24px] font-bold text-white">Choose your vibe</Text>
              <Text className="mt-2 leading-6 text-app-border">
                Vizja Friends separates social chat into focused sections, so students can join the right conversation instead of one noisy room.
              </Text>
            </View>

            {buddySections.map((section) => (
              <TouchableOpacity
                key={section.key}
                className="rounded-[26px] bg-app-surface p-5 shadow-sm"
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
                    <Text className="mt-3 text-[20px] font-bold text-app-text">{section.title}</Text>
                    <Text className="mt-2 leading-6 text-app-muted">{section.description}</Text>
                  </View>
                  <View className={`rounded-full px-3 py-2 ${section.accentClassName}`}>
                    <Text className="text-[12px] font-semibold text-app-text">{section.badgeLabel}</Text>
                  </View>
                </View>

                <View className="mt-5 flex-row items-center justify-between border-t border-app-bg-muted pt-4">
                  <Text className="text-[13px] font-semibold text-app-primary-dark">Open section</Text>
                  <Text className="text-[18px] text-app-placeholder">?</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <>
            {chatLoading ? (
              <View className="flex-1 items-center justify-center px-5">
                <AppButton title="Connecting to Lunch Buddy..." loading={true} className="bg-transparent" textClassName="mt-3 text-[15px] text-app-muted" onPress={() => {}} />
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
                    <View className="mt-10 rounded-2xl bg-app-surface p-5 shadow-sm">
                      <Text className="text-[16px] font-semibold text-app-text">Start the conversation</Text>
                      <Text className="mt-2 leading-6 text-app-muted">
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
                          isMine ? "self-end bg-app-primary" : "self-start bg-app-surface"
                        }`}
                      >
                        {!isMine ? (
                          <Text className="mb-1 text-[12px] font-semibold text-app-primary-dark">
                            {message.sender.name}
                            {message.sender.program ? ` � ${message.sender.program}` : ""}
                          </Text>
                        ) : null}

                        <Text className={isMine ? "text-[15px] leading-6 text-white" : "text-[15px] leading-6 text-app-text"}>
                          {message.text}
                        </Text>

                        <Text className={`mt-2 text-[11px] ${isMine ? "text-app-primary-light" : "text-app-placeholder"}`}>
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
                      placeholder="Ask who wants to grab lunch..."
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
                          ? "bg-app-primary"
                          : "bg-app-primary-muted"
                      }`}
                      textClassName="font-semibold text-white"
                    />
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
