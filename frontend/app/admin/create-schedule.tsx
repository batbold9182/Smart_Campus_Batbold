import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { createSchedule, deleteSchedule, getAdminSchedules, getCourses } from "../../services/scheduleService";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton, AppInput, AppCard, AppModal } from "../../components/ui";
import Toast from "react-native-toast-message";
import { confirmAction } from "../../utils/confirm";

export default function CreateScheduleScreen() {
  const [courses, setCourses] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [course, setCourse] = useState("");
  const [day, setDay] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [room, setRoom] = useState("");
  const [courseSelectorOpen, setCourseSelectorOpen] = useState(false);
  const [loadingDeleteId, setLoadingDeleteId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const selectedCourse = courses.find((c) => c._id === course);
  const selectedCourseLabel = selectedCourse?.title || "Select course";

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
      Toast.show({ type: "error", text1: "All fields required" });
      return;
    }

    const facultyId = selectedCourse?.faculty?._id || selectedCourse?.faculty;

    if (!facultyId) {
      Toast.show({ type: "error", text1: "Selected course has no assigned faculty. Assign faculty first." });
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

      Toast.show({ type: "success", text1: "Schedule created" });
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
    const target = schedules.find((s) => s._id === scheduleId);
    const ok = await confirmAction(
      "Delete schedule",
      `Delete this schedule slot${target?.course?.title ? ` for ${target.course.title}` : ""}? This cannot be undone.`,
      "Delete",
      true
    );
    if (!ok) return;
    try {
      setLoadingDeleteId(scheduleId);
      await deleteSchedule(scheduleId);
      Toast.show({ type: "success", text1: "Schedule deleted" });
      await loadSchedules();
    } catch (err: any) {
      Toast.show({ type: "error", text1: err?.response?.data?.message || "Failed to delete schedule" });
    } finally {
      setLoadingDeleteId(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-app-bg">
      <ScrollView contentContainerClassName="p-5 pb-6">
        <View className="rounded-xl bg-app-surface p-4 shadow">
          <Text className="text-app-xl font-bold text-app-text">Create Schedule</Text>
          <Text className="mb-4 mt-1 text-app-sm text-app-muted">
            Build class slots with time and room details.
          </Text>

          <Text className="mb-1 text-app-sm font-semibold text-app-text-secondary">Course</Text>
          <TouchableOpacity
            className={`mb-3 min-h-[50px] flex-row items-center justify-between rounded-xl border px-3 ${
              courses.length > 0 ? "border-app-border bg-app-surface" : "border-app-border-light bg-app-bg-muted"
            }`}
            onPress={() => setCourseSelectorOpen(true)}
            disabled={courses.length === 0}
          >
            <Text className={course ? "text-app-text" : "text-app-muted"}>{selectedCourseLabel}</Text>
            <Text className="text-app-md text-app-muted">▾</Text>
          </TouchableOpacity>

          <View className="mb-3">
            <AppInput label="Day" placeholder="e.g. Monday" value={day} onChangeText={setDay} />
          </View>
          <View className="mb-3">
            <AppInput label="Start Time" placeholder="09:00" value={startTime} onChangeText={setStartTime} />
          </View>
          <View className="mb-3">
            <AppInput label="End Time" placeholder="10:30" value={endTime} onChangeText={setEndTime} />
          </View>
          <View className="mb-4">
            <AppInput label="Room" placeholder="e.g. A101" value={room} onChangeText={setRoom} />
          </View>

          <AppButton
            title="Create Schedule"
            loading={isCreating}
            onPress={handleCreate}
          />

          <Text className="mb-2 mt-5 text-app-base font-semibold text-app-text">Existing Schedules</Text>
          {schedules.length === 0 ? (
            <Text className="mb-3 text-app-muted">No schedules found</Text>
          ) : (
            schedules.map((item) => (
              <AppCard key={item._id} variant="bordered" className="mb-2 rounded-xl border border-app-border bg-app-surface p-3">
                <Text className="font-semibold text-app-text">
                  {item.course?.title || item.course?.name || "Course"}
                </Text>
                <Text className="mb-2 text-app-muted">{item.day} • {item.startTime}-{item.endTime} • Room {item.room}</Text>
                <AppButton
                  title="Delete"
                  size="sm"
                  variant="danger"
                  loading={loadingDeleteId === item._id}
                  onPress={() => handleDelete(item._id)}
                />
              </AppCard>
            ))
          )}

          <AppButton
            title="Back to Dashboard"
            onPress={() => router.push("/admin/dashboard")}
          />
        </View>

        <View className="mt-3 rounded-xl bg-app-surface p-4 shadow-sm">
          <Text className="text-app-base font-semibold text-app-text">Hint</Text>
          <Text className="mt-2 text-app-sm text-app-muted">
            Create schedules only after courses are assigned to faculty.
          </Text>
        </View>

        <AppModal open={courseSelectorOpen} onClose={() => setCourseSelectorOpen(false)} layout="bottom">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-app-md font-bold text-app-text">Select Course</Text>
            <TouchableOpacity onPress={() => setCourseSelectorOpen(false)}>
              <Text className="text-app-sm font-semibold text-app-primary">Done</Text>
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {courses.length === 0 ? (
              <Text className="py-3 text-app-text-subtle">No courses available.</Text>
            ) : (
              courses.map((c) => {
                const active = course === c._id;
                return (
                  <TouchableOpacity
                    key={c._id}
                    className={`mb-2 rounded-lg border px-3 py-3 ${
                      active ? "border-app-primary bg-app-primary-bg" : "border-app-border-light bg-app-surface"
                    }`}
                    onPress={() => {
                      setCourse(c._id);
                      setCourseSelectorOpen(false);
                    }}
                  >
                    <Text className={`font-medium ${active ? "text-app-primary-dark" : "text-app-text"}`}>
                      {c.title}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </AppModal>
    </ScrollView>
    </SafeAreaView>
  );
}
