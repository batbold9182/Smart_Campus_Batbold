import { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  assignSchedule,
  getStudents,
  getSchedules,
} from "../../services/adminScheduleService";
import { useRouter } from "expo-router";

export default function AssignScheduleScreen() {
  const [students, setStudents] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [studentId, setStudentId] = useState("");
  const [scheduleId, setScheduleId] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsData, schedulesData] = await Promise.all([
        getStudents(),
        getSchedules(),
      ]);
      setStudents(studentsData);
      setSchedules(schedulesData);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Failed to load students or schedules";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!studentId || !scheduleId) {
      alert("Select student and schedule");
      return;
    }

    try {
      setLoading(true);
      await assignSchedule(studentId, scheduleId);
      alert("Schedule assigned");
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to assign schedule";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧑‍🎓 Assign Schedule</Text>

      <Text>Student</Text>
      <Picker selectedValue={studentId} onValueChange={setStudentId}>
        <Picker.Item label="Select student" value="" />
        {students.map((s) => (
          <Picker.Item key={s._id} label={s.name} value={s._id} />
        ))}
      </Picker>

      <Text>Schedule</Text>
      <Picker selectedValue={scheduleId} onValueChange={setScheduleId}>
        <Picker.Item label="Select schedule" value="" />
        {schedules.map((sc) => (
          <Picker.Item
            key={sc._id}
            label={`${sc.course?.title || sc.course?.name || "Course"} - ${sc.day} ${sc.startTime}`}
            value={sc._id}
          />
        ))}
      </Picker>
      <Button
        title="Back to dashboard"
        onPress={() => router.push("/(admin)/dashboard")}
      />
      <Button
        title={loading ? "Please wait..." : "Assign Schedule"}
        onPress={handleAssign}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
});
