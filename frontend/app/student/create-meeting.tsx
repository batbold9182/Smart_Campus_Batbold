import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import ScreenLayout from "../../components/ScreenLayout";
import { AppButton } from "../../components/ui";

export default function CreateMeeting() {
  const router = useRouter();

  return (
    <ScreenLayout title="Create Meeting" backRoute="/student/dashboard">
      <View className="mb-4 rounded-xl bg-app-surface p-4 shadow-card border border-app-border-light">
        <Text className="mb-2 text-app-base font-semibold text-app-text">Feature Coming Soon</Text>
        <Text className="text-app-sm text-app-muted">
          Team projects can be discussed and meetings scheduled here. This will include live whiteboard, live chat, share links, and more.
        </Text>
      </View>

      <AppButton onPress={() => router.push("/student/dashboard")}>
        Back to Dashboard
      </AppButton>
    </ScreenLayout>
  );
}
