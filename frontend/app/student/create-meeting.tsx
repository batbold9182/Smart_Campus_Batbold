import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function CreateMeeting() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#f5f7fb]" edges={["top"]}>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-5">
        <Text className="mb-4 text-[22px] font-bold text-[#111827]">Create Meeting section</Text>

        <View className="mb-4 rounded-xl bg-white p-4 shadow">
          <Text className="mb-2 text-[16px] font-semibold text-[#111827]">Feature Coming Soon</Text>
          <Text className="text-[#6b7280]">
            Team projects can be discussed and meetings can be scheduled here. This will include live whiteboard,live chat,generates share links, and more.
            also whiteboard can be saved as pdf or image for later reference.
          </Text>
          <Text className="text-[#6b7280] mt-2">
            Implement this feature if i can.
          </Text>
        </View>

        <TouchableOpacity
          className="items-center rounded-lg bg-blue-500 p-[14px]"
          onPress={() => router.push("/student/dashboard")}
        >
          <Text className="font-semibold text-white">Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
