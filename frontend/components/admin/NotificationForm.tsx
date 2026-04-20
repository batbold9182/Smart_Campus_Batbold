import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { AppButton, AppCard, AppInput } from "../ui";

export type Audience = "students" | "faculty" | "all" | "specificStudent" | "specificFaculty";

export type RecipientOption = {
  id: string;
  name: string;
  email: string;
  identifier: string;
};

const audienceOptions: { value: Audience; label: string; description: string }[] = [
  { value: "students", label: "Students", description: "Send to all students" },
  { value: "faculty", label: "Faculty", description: "Send to all faculty" },
  { value: "all", label: "Students + Faculty", description: "Send campus-wide" },
  { value: "specificStudent", label: "Specific Student", description: "Choose one student" },
  { value: "specificFaculty", label: "Specific Faculty", description: "Choose one faculty member" },
];

type Props = {
  title: string;
  setTitle: (v: string) => void;
  message: string;
  setMessage: (v: string) => void;
  audience: Audience;
  setAudience: (v: Audience) => void;
  sending: boolean;
  onSend: () => void;
  isSpecificAudience: boolean;
  selectedRecipient: RecipientOption | null;
  loadingRecipients: boolean;
  recipientOptions: RecipientOption[];
  onOpenRecipientSelector: () => void;
};

export default function NotificationForm({
  title,
  setTitle,
  message,
  setMessage,
  audience,
  setAudience,
  sending,
  onSend,
  isSpecificAudience,
  selectedRecipient,
  loadingRecipients,
  recipientOptions,
  onOpenRecipientSelector,
}: Props) {
  const selectedAudienceMeta = audienceOptions.find((o) => o.value === audience);

  return (
    <AppCard className="rounded-2xl border border-app-border-light bg-app-surface p-4 shadow-sm">
      <Text className="text-2xl font-bold text-app-text">Notifications</Text>
      <Text className="mb-5 mt-1 text-app-sm text-app-muted">
        Send announcements to all users or target a single faculty member or student by ID.
      </Text>

      <View className="mb-[14px] rounded-lg border border-app-border bg-app-bg p-3">
        <Text className="mb-[10px] text-app-base font-bold text-app-text">Send Notification</Text>

        <View className="mb-3">
          <AppInput
            label="Title"
            value={title}
            onChangeText={setTitle}
            placeholder="Notification title"
          />
        </View>

        <View className="mb-3">
          <AppInput
            label="Message"
            value={message}
            onChangeText={setMessage}
            placeholder="Notification message"
            multiline
            textAlignVertical="top"
            style={{ minHeight: 80 }}
          />
        </View>

        <Text className="mb-[6px] text-app-sm text-app-text">Audience</Text>
        <View className="mb-[10px] flex-row flex-wrap gap-2">
          {audienceOptions.map((option) => {
            const isActive = audience === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                className={`flex-1 rounded-xl border px-3 py-3 ${
                  isActive ? "border-app-primary bg-app-primary-light" : "border-app-border bg-app-surface"
                }`}
                style={{ minWidth: "45%" }}
                onPress={() => setAudience(option.value)}
              >
                <Text className={`text-app-sm font-semibold ${isActive ? "text-app-primary" : "text-app-text"}`}>
                  {option.label}
                </Text>
                <Text className={`mt-1 text-app-xs ${isActive ? "text-app-primary" : "text-app-muted"}`}>
                  {option.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="mb-[10px] rounded-xl border border-app-border bg-app-surface px-3 py-3">
          <Text className="text-app-xs uppercase tracking-[0.6px] text-app-muted">Current Audience</Text>
          <Text className="mt-1 text-app-base font-semibold text-app-text">{selectedAudienceMeta?.label}</Text>
          <Text className="mt-1 text-app-sm text-app-muted">{selectedAudienceMeta?.description}</Text>
        </View>

        {isSpecificAudience ? (
          <View className="mb-[10px]">
            <Text className="mb-[6px] text-app-sm text-app-text">Recipient</Text>
            {loadingRecipients ? (
              <View className="rounded-xl border border-app-border bg-app-surface px-3 py-4">
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator size="small" />
                  <Text className="text-app-sm text-app-muted">Loading recipients...</Text>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                className="rounded-xl border border-app-border bg-app-surface px-3 py-4"
                onPress={onOpenRecipientSelector}
                disabled={recipientOptions.length === 0}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 pr-3">
                    <Text className="text-app-xs uppercase tracking-[0.6px] text-app-muted">Selected Recipient</Text>
                    <Text
                      className={`mt-1 text-app-base font-semibold ${
                        selectedRecipient ? "text-app-text" : "text-app-muted"
                      }`}
                    >
                      {selectedRecipient ? selectedRecipient.name : "Tap to choose a recipient"}
                    </Text>
                    <Text className="mt-1 text-app-sm text-app-muted">
                      {selectedRecipient
                        ? [selectedRecipient.email, selectedRecipient.identifier].filter(Boolean).join(" • ")
                        : "Opens a list of matching users"}
                    </Text>
                  </View>
                  <Text className="text-app-md text-app-muted">▾</Text>
                </View>
              </TouchableOpacity>
            )}
            {!loadingRecipients && recipientOptions.length === 0 ? (
              <Text className="mt-[6px] text-app-xs text-app-muted">No users found for this audience.</Text>
            ) : null}
          </View>
        ) : null}

        <AppButton
          title="Send Notification"
          loading={sending}
          onPress={onSend}
        />
      </View>
    </AppCard>
  );
}
