import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
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
  const router = useRouter();

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await Promise.all([loadCourses(), loadSchedules()]);
  };

  const loadCourses = async () => {
    const data = await getCourses();
    setCourses(data);
  };

  const loadSchedules = async () => {
    const data = await getAdminSchedules();
    setSchedules(Array.isArray(data) ? data : []);
  };

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
    <SafeAreaView className="flex-1 bg-[#f5f7fb]">
      <ScrollView contentContainerClassName="p-5 pb-6">
        <View className="rounded-xl bg-white p-4 shadow">
          <Text className="mb-3 text-[22px] font-bold text-[#111827]">📅 Create Schedule</Text>

        <Text className="mb-1 font-medium text-[#374151]">Course</Text>
        <View className="mb-3 rounded-lg border border-[#d1d5db] bg-white">
          <Picker selectedValue={course} onValueChange={setCourse}>
            <Picker.Item label="Select course" value="" />
            {courses.map((c) => (
              <Picker.Item key={c._id} label={c.title} value={c._id} />
            ))}
          </Picker>
        </View>

        <TextInput placeholder="Day (e.g. Monday)" value={day} onChangeText={setDay} className="mb-3 rounded-lg border border-[#d1d5db] bg-white px-3 py-3" />
        <TextInput placeholder="Start Time (09:00)" value={startTime} onChangeText={setStartTime} className="mb-3 rounded-lg border border-[#d1d5db] bg-white px-3 py-3" />
        <TextInput placeholder="End Time (10:30)" value={endTime} onChangeText={setEndTime} className="mb-3 rounded-lg border border-[#d1d5db] bg-white px-3 py-3" />
        <TextInput placeholder="Room" value={room} onChangeText={setRoom} className="mb-4 rounded-lg border border-[#d1d5db] bg-white px-3 py-3" />

        <View className="mb-2">
          <Button title="Create Schedule" onPress={handleCreate} />
        </View>

        <Text className="mb-2 mt-5 text-[16px] font-semibold text-[#111827]">Existing Schedules</Text>
        {schedules.length === 0 ? (
          <Text className="mb-3 text-[#6b7280]">No schedules found</Text>
        ) : (
          schedules.map((item) => (
            <View key={item._id} className="mb-2 rounded-lg border border-[#d1d5db] p-3">
              <Text className="font-semibold text-[#111827]">
                {item.course?.title || item.course?.name || "Course"}
              </Text>
              <Text className="mb-2 text-[#6b7280]">{item.day} • {item.startTime}-{item.endTime} • Room {item.room}</Text>
              <Button
                title={loadingDeleteId === item._id ? "Deleting..." : "Delete"}
                color="red"
                disabled={loadingDeleteId === item._id}
                onPress={() => handleDelete(item._id)}
              />
            </View>
          ))
        )}

        <Button title="Back to dashboard" onPress={() => router.push("../dashboard")} />
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}
