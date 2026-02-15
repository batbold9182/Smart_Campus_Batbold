import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
} from "react-native";
import { createSchedule, getCourses } from "../../services/scheduleService";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";

export default function CreateScheduleScreen() {
  const [courses, setCourses] = useState<any[]>([]);
  const [course, setCourse] = useState("");
  const [day, setDay] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [room, setRoom] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    const data = await getCourses();
    setCourses(data);
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
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📅 Create Schedule</Text>

      <Text>Course</Text>
      <Picker selectedValue={course} onValueChange={setCourse}>
        <Picker.Item label="Select course" value="" />
        {courses.map((c) => (
          <Picker.Item key={c._id} label={c.title} value={c._id} />
        ))}
      </Picker>

      <TextInput placeholder="Day (e.g. Monday)" value={day} onChangeText={setDay} style={styles.input} />
      <TextInput placeholder="Start Time (09:00)" value={startTime} onChangeText={setStartTime} style={styles.input} />
      <TextInput placeholder="End Time (10:30)" value={endTime} onChangeText={setEndTime} style={styles.input} />
      <TextInput placeholder="Room" value={room} onChangeText={setRoom} style={styles.input} />

      <Button title="Create Schedule" onPress={handleCreate} />
      <Button title="Back to dashboard" onPress={() => router.push("../dashboard")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
});
