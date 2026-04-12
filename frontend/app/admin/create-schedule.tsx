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

export default function CreateScheduleScreen() {
  const inputClassName = "mb-3 rounded-xl border border-app-placeholder bg-app-surface px-3 py-3 text-[16px] text-app-text";
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
      alert("All fields required");
      return;
    }

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

          <Text className="mb-1 text-[13px] font-semibold text-app-text-secondary">Course</Text>
          <TouchableOpacity
            className={`mb-3 min-h-[50px] flex-row items-center justify-between rounded-xl border px-3 ${
              courses.length > 0 ? "border-app-border bg-app-surface" : "border-app-border-light bg-app-bg-muted"
            }`}
            onPress={() => setCourseSelectorOpen(true)}
            disabled={courses.length === 0}
          >
            <Text className={course ? "text-app-text" : "text-app-muted"}>{selectedCourseLabel}</Text>
            <Text className="text-[18px] text-app-muted">▾</Text>
          </TouchableOpacity>

          <AppInput placeholder="Day (e.g. Monday)" value={day} onChangeText={setDay} className={inputClassName} />
          <AppInput placeholder="Start Time (09:00)" value={startTime} onChangeText={setStartTime} className={inputClassName} />
          <AppInput placeholder="End Time (10:30)" value={endTime} onChangeText={setEndTime} className={inputClassName} />
          <AppInput placeholder="Room" value={room} onChangeText={setRoom} className={`${inputClassName} mb-4`} />

          <AppButton
            title={isCreating ? "Creating..." : "Create Schedule"}
            loading={isCreating}
            onPress={handleCreate}
            className={`mb-2 items-center rounded-xl px-4 py-3 ${isCreating ? "bg-app-primary-loading" : "bg-blue-500"}`}
            textClassName="font-semibold text-white"
          />

          <Text className="mb-2 mt-5 text-[16px] font-semibold text-app-text">Existing Schedules</Text>
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
                  title={loadingDeleteId === item._id ? "Deleting..." : "Delete"}
                  variant="danger"
                  loading={loadingDeleteId === item._id}
                  onPress={() => handleDelete(item._id)}
                  className={`items-center rounded-lg px-3 py-2 ${loadingDeleteId === item._id ? "bg-app-error-loading" : "bg-red-500"}`}
                  textClassName="font-semibold text-white"
                />
              </AppCard>
            ))
          )}

          <AppButton
            title="Back to Dashboard"
            variant="outline"
            onPress={() => router.push("/admin/dashboard")}
            className="mt-2 items-center rounded-xl border border-app-border bg-app-surface px-4 py-3"
            textClassName="font-semibold text-app-text"
          />
        </View>

        <View className="mt-3 rounded-xl bg-app-surface p-4 shadow-sm">
          <Text className="text-[16px] font-semibold text-app-text">Hint</Text>
          <Text className="mt-2 text-[13px] text-app-muted">
            Create schedules only after courses are assigned to faculty.
          </Text>
        </View>

        <AppModal open={courseSelectorOpen} onClose={() => setCourseSelectorOpen(false)} layout="bottom">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-[17px] font-bold text-app-text">Select Course</Text>
            <TouchableOpacity onPress={() => setCourseSelectorOpen(false)}>
              <Text className="text-[14px] font-semibold text-app-primary">Done</Text>
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
