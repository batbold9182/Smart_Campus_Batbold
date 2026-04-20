import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { AppButton } from "../../components/ui";

export default function Exam() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={["top"]}>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-5">
        <Text className="mb-4 text-app-xl font-bold text-app-text">Exam</Text>

        <View className="mb-4 rounded-xl bg-app-surface p-4 shadow">
          <Text className="mb-2 text-app-base font-semibold text-app-text">Feature Coming Soon</Text>
          <Text className="text-app-muted">
            Exam scheduling, grading workflows, and result publishing tools will be added here.
          </Text>
        </View>

        <AppButton onPress={() => router.push("/faculty/dashboard")}>
          Back to Dashboard
        </AppButton>
      </ScrollView>
    </SafeAreaView>
  );
}
