import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { createSchedule, deleteSchedule, getAdminSchedules, getCourses } from "../../services/scheduleService";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateScheduleScreen() {
  const [courses, setCourses] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [course, setCourse] = useState("");
  const [day, setDay] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [room, setRoom] = useState("");
  const [loadingDeleteId, setLoadingDeleteId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const loadCourses = useCallback(async () => {
    const data = await getCourses();
    setCourses(data);
  }, []);

  const loadSchedules = useCallback(async () => {
    const data = await getAdminSchedules();
    setSchedules(Array.isArray(data) ? data : []);
  }, []);

  const loadAll = useCallback(async () => {
    await Promise.all([loadCourses(), loadSchedules()]);
  }, [loadCourses, loadSchedules]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleCreate = async () => {
    if (!course || !day || !startTime || !endTime || !room) {
      alert("All fields required");
      return;
    }

    const selectedCourse = courses.find((c) => c._id === course);
    const facultyId = selectedCourse?.faculty?._id || selectedCourse?.faculty;

    if (!facultyId) {
      alert("Selected course has no assigned faculty. Please assign faculty first.");
      return;
    }

    try {
      setIsCreating(true);
      await createSchedule({
        courseId: course,
        facultyId,
        day,
        startTime,
        endTime,
        room,
      });

      alert("Schedule created");
      setCourse("");
      setDay("");
      setStartTime("");
      setEndTime("");
      setRoom("");
      await loadSchedules();
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (scheduleId: string) => {
    try {
      setLoadingDeleteId(scheduleId);
      await deleteSchedule(scheduleId);
      alert("Schedule deleted");
      await loadSchedules();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete schedule");
    } finally {
      setLoadingDeleteId(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-app-bg">
      <ScrollView contentContainerClassName="p-5 pb-6">
        <View className="rounded-xl bg-app-surface p-4 shadow">
          <Text className="text-[24px] font-bold text-app-text">Create Schedule</Text>
          <Text className="mb-4 mt-1 text-[13px] text-app-muted">
            Build class slots with time and room details.
          </Text>

          <Text className="mb-1 text-[13px] font-semibold text-[#374151]">Course</Text>
          <View className="mb-3 rounded-xl border border-app-border bg-app-surface">
            <Picker selectedValue={course} onValueChange={setCourse}>
              <Picker.Item label="Select course" value="" />
              {courses.map((c) => (
                <Picker.Item key={c._id} label={c.title} value={c._id} />
              ))}
            </Picker>
          </View>

          <TextInput placeholder="Day (e.g. Monday)" value={day} onChangeText={setDay} className="mb-3 rounded-xl border border-app-border bg-app-surface px-3 py-3" />
          <TextInput placeholder="Start Time (09:00)" value={startTime} onChangeText={setStartTime} className="mb-3 rounded-xl border border-app-border bg-app-surface px-3 py-3" />
          <TextInput placeholder="End Time (10:30)" value={endTime} onChangeText={setEndTime} className="mb-3 rounded-xl border border-app-border bg-app-surface px-3 py-3" />
          <TextInput placeholder="Room" value={room} onChangeText={setRoom} className="mb-4 rounded-xl border border-app-border bg-app-surface px-3 py-3" />

          <TouchableOpacity
            className={`mb-2 items-center rounded-xl px-4 py-3 ${isCreating ? "bg-[#93c5fd]" : "bg-blue-500"}`}
            onPress={handleCreate}
            disabled={isCreating}
          >
            <Text className="font-semibold text-white">{isCreating ? "Creating..." : "Create Schedule"}</Text>
          </TouchableOpacity>

          <Text className="mb-2 mt-5 text-[16px] font-semibold text-app-text">Existing Schedules</Text>
          {schedules.length === 0 ? (
            <Text className="mb-3 text-app-muted">No schedules found</Text>
          ) : (
            schedules.map((item) => (
              <View key={item._id} className="mb-2 rounded-xl border border-app-border bg-white p-3">
                <Text className="font-semibold text-app-text">
                  {item.course?.title || item.course?.name || "Course"}
                </Text>
                <Text className="mb-2 text-app-muted">{item.day} • {item.startTime}-{item.endTime} • Room {item.room}</Text>
                <TouchableOpacity
                  className={`items-center rounded-lg px-3 py-2 ${loadingDeleteId === item._id ? "bg-[#fca5a5]" : "bg-red-500"}`}
                  disabled={loadingDeleteId === item._id}
                  onPress={() => handleDelete(item._id)}
                >
                  <Text className="font-semibold text-white">{loadingDeleteId === item._id ? "Deleting..." : "Delete"}</Text>
                </TouchableOpacity>
              </View>
            ))
          )}

          <TouchableOpacity
            className="mt-2 items-center rounded-xl border border-app-border bg-white px-4 py-3"
            onPress={() => router.push("../dashboard")}
          >
            <Text className="font-semibold text-app-text">Back to Dashboard</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-3 rounded-xl bg-app-surface p-4 shadow-sm">
          <Text className="text-[16px] font-semibold text-app-text">Hint</Text>
          <Text className="mt-2 text-[13px] text-app-muted">
            Create schedules only after courses are assigned to faculty.
          </Text>
        </View>
    </ScrollView>
    </SafeAreaView>
  );
}
