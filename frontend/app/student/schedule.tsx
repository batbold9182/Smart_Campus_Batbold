import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { getStudentSchedule } from "../../services/scheduleService";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
export default function StudentScheduleScreen() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();
    const loadSchedule = async () => {
      try {
        const data = await getStudentSchedule(controller.signal);
        setSchedule(data);
      } catch (err: any) {
        if (err?.name !== "CanceledError" && err?.code !== "ERR_CANCELED") {
          setError("Failed to load schedule. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };
    loadSchedule();
    return () => controller.abort();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={["top"]}>
      <View className="flex-1 px-5 pb-4">
        <Text className="mb-4 text-[22px] font-bold text-app-text">My Schedule</Text>

        {loading ? (
          <View className="rounded-xl bg-app-surface p-4 shadow">
            <Text className="text-center text-app-muted">Loading schedule...</Text>
          </View>
        ) : error ? (
          <View className="rounded-xl bg-app-surface p-4 shadow">
            <Text className="text-center text-red-500">{error}</Text>
          </View>
        ) : schedule.length === 0 ? (
          <View className="rounded-xl bg-app-surface p-4 shadow">
            <Text className="text-center text-app-muted">No schedule assigned yet</Text>
          </View>
        ) : (
          <FlatList
            data={schedule}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View className="mb-3 rounded-xl bg-app-surface p-4 shadow">
                <Text className="text-[16px] font-bold text-app-text">{item.course?.title || item.course?.name || "Untitled Course"}</Text>
                <Text className="mt-1 text-app-muted">Day: {item.day}</Text>
                <Text className="text-app-muted">Time: {item.startTime} - {item.endTime}</Text>
                <Text className="text-app-muted">Room: {item.room}</Text>
              </View>
            )}
          />
        )}

        <TouchableOpacity
          className="mt-3 items-center rounded-lg bg-blue-500 p-[14px]"
          onPress={() => router.push("/student/dashboard")}
        >
          <Text className="font-semibold text-white">Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
