import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function Attendance() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#f5f7fb]" edges={["top"]}>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-5">
        <Text className="mb-4 text-[22px] font-bold text-[#111827]">Attendance</Text>

        <View className="mb-4 rounded-xl bg-white p-4 shadow">
          <Text className="mb-2 text-[16px] font-semibold text-[#111827]">Feature Coming Soon</Text>
          <Text className="text-[#6b7280]">
            Daily attendance controls and class-by-class tracking will appear on this page.
          </Text>
        </View>

        <TouchableOpacity
          className="items-center rounded-lg bg-blue-500 p-[14px]"
          onPress={() => router.push("/(faculty)/dashboard")}
        >
          <Text className="font-semibold text-white">Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
