import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { getStudentSchedule } from "../../services/scheduleService";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
export default function StudentScheduleScreen() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const data = await getStudentSchedule();
      setSchedule(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f5f7fb]" edges={["top"]}>
      <View className="flex-1 px-5 pb-4">
        <Text className="mb-4 text-[22px] font-bold text-[#111827]">My Schedule</Text>

        {loading ? (
          <View className="rounded-xl bg-white p-4 shadow">
            <Text className="text-center text-[#6b7280]">Loading schedule...</Text>
          </View>
        ) : schedule.length === 0 ? (
          <View className="rounded-xl bg-white p-4 shadow">
            <Text className="text-center text-[#6b7280]">No schedule assigned yet</Text>
          </View>
        ) : (
          <FlatList
            data={schedule}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View className="mb-3 rounded-xl bg-white p-4 shadow">
                <Text className="text-[16px] font-bold text-[#111827]">{item.course?.title || item.course?.name || "Untitled Course"}</Text>
                <Text className="mt-1 text-[#6b7280]">Day: {item.day}</Text>
                <Text className="text-[#6b7280]">Time: {item.startTime} - {item.endTime}</Text>
                <Text className="text-[#6b7280]">Room: {item.room}</Text>
              </View>
            )}
          />
        )}

        <TouchableOpacity
          className="mt-3 items-center rounded-lg bg-blue-500 p-[14px]"
          onPress={() => router.push("/(student)/dashboard")}
        >
          <Text className="font-semibold text-white">Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
