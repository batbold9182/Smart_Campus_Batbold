import { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { getStudentSchedule } from "../../services/scheduleService";
import { useRouter } from "expo-router";
import ScreenLayout from "../../components/ScreenLayout";
import { SkeletonList } from "../../components/Skeleton";
import { AppButton } from "../../components/ui";

export default function StudentScheduleScreen() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const loadSchedule = (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    getStudentSchedule(signal)
      .then((data) => setSchedule(data))
      .catch((err: any) => {
        if (err?.name !== "CanceledError" && err?.code !== "ERR_CANCELED") {
          setError("Failed to load schedule. Please try again.");
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const controller = new AbortController();
    loadSchedule(controller.signal);
    return () => controller.abort();
  }, []);

  return (
    <ScreenLayout title="My Schedule" backRoute="/student/dashboard">
      {loading ? (
        <SkeletonList rows={4} />
      ) : error ? (
        <View className="mb-3 rounded-xl bg-app-surface p-4 shadow-card">
          <Text className="mb-3 text-center text-app-error">{error}</Text>
          <AppButton onPress={() => loadSchedule()}>Retry</AppButton>
        </View>
      ) : schedule.length === 0 ? (
        <View className="items-center rounded-xl bg-app-surface p-8 shadow-card">
          <Text className="text-app-base font-semibold text-app-text">No schedule assigned yet</Text>
          <Text className="mt-1 text-app-sm text-app-muted">Your timetable will appear here once it is set up.</Text>
        </View>
      ) : (
        <FlatList
          data={schedule}
          keyExtractor={(item) => item._id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View className="mb-3 rounded-xl bg-app-surface p-4 shadow-card border border-app-border-light">
              <Text className="text-app-base font-bold text-app-text">{item.course?.title || item.course?.name || "Untitled Course"}</Text>
              <Text className="mt-2 text-app-sm text-app-muted">
                {item.day} · {item.startTime} – {item.endTime}
              </Text>
              <Text className="mt-1 text-app-sm text-app-placeholder">Room {item.room}</Text>
            </View>
          )}
        />
      )}

      <AppButton onPress={() => router.push("/student/dashboard")}>
        Back to Dashboard
      </AppButton>
    </ScreenLayout>
  );
}
