import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRef, useState } from "react";
import { useRouter } from "expo-router";
import { useLearningBuddy } from "../../hooks/useLearningBuddy";
import { useUserStore } from "../../store/useUserStore";
import { AppButton, AppInput } from "../../components/ui";

const formatMessageTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function LearningBuddy() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView | null>(null);
  const { user } = useUserStore();
  const [draft, setDraft] = useState("");

  const scrollToEnd = () => requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));

  const { messages, loading, sending, error, statusLabel, onlineCount, send, isConnected } =
    useLearningBuddy();

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    if (text.length > 400) {
      Alert.alert("Message too long", "Keep messages under 400 characters.");
      return;
    }
    send(
      text,
      () => { setDraft(""); scrollToEnd(); },
      (msg) => Alert.alert("Unable to send", msg)
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-app-bg" edges={["top"]}>
        <AppButton title="Loading Learning Buddy..." loading={true} className="bg-transparent" textClassName="mt-3 text-[15px] text-app-muted" onPress={() => {}} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={["top"]}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View className="border-b border-app-border-light bg-app-surface px-5 pb-4 pt-2">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-[22px] font-bold text-app-text">📘 Learning Buddy</Text>
              <Text className="mt-1 text-[13px] text-app-muted">
                Study partners, revision circles, and assignment help.
              </Text>
            </View>
            <AppButton
              title="Sections"
              variant="ghost"
              onPress={() => router.back()}
              className="rounded-full bg-app-success-light px-4 py-2"
              textClassName="font-semibold text-app-success-dark"
            />
          </View>

          <View className="mt-4 flex-row flex-wrap gap-2">
            <View className="rounded-full bg-app-success-light px-3 py-2">
              <Text className="text-[12px] font-semibold text-app-success-dark">{statusLabel}</Text>
            </View>
            <View className="rounded-full bg-app-success-bg px-3 py-2">
              <Text className="text-[12px] font-semibold text-app-success">{onlineCount} students online</Text>
            </View>
            {user?.program ? (
              <View className="rounded-full bg-app-bg-muted px-3 py-2">
                <Text className="text-[12px] font-semibold text-app-text-secondary">{user.program}</Text>
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
            const isMine = message.sender.id === user?._id;
            return (
              <View
                key={message.id}
                className={`max-w-[88%] rounded-2xl px-4 py-3 ${isMine ? "self-end bg-app-success-accent" : "self-start bg-app-surface"}`}
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
            <AppInput
              multiline
              maxLength={400}
              placeholder="Ask about a topic, form a study group..."
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
              className={`rounded-full px-5 py-3 ${draft.trim() && !sending && isConnected() ? "bg-app-success-accent" : "bg-app-success-timestamp"}`}
              textClassName="font-semibold text-white"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
