import { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  assignSchedule,
  getStudents,
  getSchedules,
} from "../../services/adminScheduleService";
import { useRouter } from "expo-router";
import { unassignSchedule } from "@/services/scheduleService";
import { adminStyles } from "../../styles/adminStyles";

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

  const handleUnassign = async () => {
    if (!studentId || !scheduleId) {
      alert("Select student and schedule");
      return;
    }

    try {
      setLoading(true);
      await unassignSchedule(studentId, scheduleId);
      alert("Schedule unassigned");
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to unassign schedule";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className={adminStyles.screen}>
      <View className={adminStyles.card}>
        <Text className="mb-3 text-[22px] font-bold text-[#111827]">🧑‍🎓 Assign Schedule</Text>

        <Text className="mb-1 font-medium text-[#374151]">Student</Text>
        <View className={adminStyles.pickerWrap}>
          <Picker selectedValue={studentId} onValueChange={setStudentId}>
            <Picker.Item label="Select student" value="" />
            {students.map((s) => (
              <Picker.Item key={s._id} label={s.name} value={s._id} />
            ))}
          </Picker>
        </View>

        <Text className="mb-1 font-medium text-[#374151]">Schedule</Text>
        <View className={adminStyles.pickerWrap}>
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
        </View>

        <View className="gap-2">
          <Button
            title={loading ? "Please wait..." : "Assign Schedule"}
            onPress={handleAssign}
            disabled={loading}
          />
          <Button
            title="Unassign Schedule"
            color="red"
            onPress={handleUnassign}
            disabled={loading}
          />
          <Button
            title="Back to dashboard"
            onPress={() => router.push("/(admin)/dashboard")}
          />
        </View>
      </View>
    </View>
  );
}
