import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import {
  assignSchedule,
  getStudents,
  getSchedules,
} from "../../services/adminServices/adminScheduleService";
import { useRouter } from "expo-router";
import { unassignSchedule } from "@/services/scheduleService";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton, AppCard, AppModal } from "../../components/ui";

export default function AssignScheduleScreen() {
  const [students, setStudents] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [studentId, setStudentId] = useState("");
  const [scheduleId, setScheduleId] = useState("");
  const [activeSelector, setActiveSelector] = useState<"student" | "schedule" | null>(null);
  const [lastSelector, setLastSelector] = useState<"student" | "schedule" | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const selectedStudentLabel =
    students.find((s) => s._id === studentId)?.name || "Select student";

  const selectedScheduleLabel =
    schedules.find((sc) => sc._id === scheduleId)
      ? `${schedules.find((sc) => sc._id === scheduleId)?.course?.title || schedules.find((sc) => sc._id === scheduleId)?.course?.name || "Course"} - ${schedules.find((sc) => sc._id === scheduleId)?.day} ${schedules.find((sc) => sc._id === scheduleId)?.startTime}`
      : "Select schedule";

  const selectorType = activeSelector ?? lastSelector;

  const selectorTitle =
    selectorType === "student"
      ? "Select Student"
      : selectorType === "schedule"
      ? "Select Schedule"
      : "";
  const selectorOptions =
    selectorType === "student"
      ? students.map((s) => ({ label: s.name, value: s._id }))
      : selectorType === "schedule"
      ? schedules.map((sc) => ({
          label: `${sc.course?.title || sc.course?.name || "Course"} - ${sc.day} ${sc.startTime}`,
          value: sc._id,
        }))
      : [];

  const emptySelectorMessage =
    selectorType === "student"
      ? "No students available."
      : selectorType === "schedule"
      ? "No schedules available."
      : "No options available.";

  const selectorCloseLabel =
    selectorType === "student"
      ? "Close Student List"
      : selectorType === "schedule"
      ? "Close Schedule List"
      : "Close";

  const handleSelectOption = (value: string) => {
    if (activeSelector === "student") {
      setStudentId(value);
    } else if (activeSelector === "schedule") {
      setScheduleId(value);
    }
    setActiveSelector(null);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeSelector !== null) {
      setLastSelector(activeSelector);
    }
  }, [activeSelector]);

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
    <SafeAreaView className="flex-1 bg-app-bg" edges={["top"]}>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-6" showsVerticalScrollIndicator={false}>
        <AppCard className="rounded-2xl border border-app-border-light bg-app-surface p-4 shadow-sm">
          <Text className="text-[24px] font-bold text-app-text">Assign Schedule</Text>
          <Text className="mb-4 mt-1 text-[13px] text-app-muted">
            Link a student to a class schedule or remove an existing assignment.
          </Text>

          <Text className="mb-1 text-[13px] font-semibold text-app-text-secondary">Student</Text>
          <TouchableOpacity
            className="mb-3 min-h-[50px] flex-row items-center justify-between rounded-xl border border-app-border bg-app-surface px-3"
            onPress={() => setActiveSelector("student")}
          >
            <Text className={studentId ? "text-app-text" : "text-app-muted"}>{selectedStudentLabel}</Text>
            <Text className="text-[18px] text-app-muted">?</Text>
          </TouchableOpacity>

          <Text className="mb-1 text-[13px] font-semibold text-app-text-secondary">Schedule</Text>
          <TouchableOpacity
            className="mb-4 min-h-[50px] flex-row items-center justify-between rounded-xl border border-app-border bg-app-surface px-3"
            onPress={() => setActiveSelector("schedule")}
          >
            <Text className={scheduleId ? "text-app-text" : "text-app-muted"}>{selectedScheduleLabel}</Text>
            <Text className="text-[18px] text-app-muted">?</Text>
          </TouchableOpacity>

          <View className="gap-2">
            <AppButton
              title={loading ? "Please wait..." : "Assign Schedule"}
              loading={loading}
              onPress={handleAssign}
              className={`items-center rounded-xl px-4 py-3 ${loading ? "bg-app-primary-loading" : "bg-blue-500"}`}
              textClassName="font-semibold text-white"
            />

            <AppButton
              title="Unassign Schedule"
              variant="danger"
              loading={loading}
              onPress={handleUnassign}
              className={`items-center rounded-xl px-4 py-3 ${loading ? "bg-app-error-loading" : "bg-red-500"}`}
              textClassName="font-semibold text-white"
            />

            <AppButton
              title="Back to Dashboard"
              variant="outline"
              onPress={() => router.push("/admin/dashboard")}
              className="items-center rounded-xl border border-app-border bg-app-surface px-4 py-3"
              textClassName="font-semibold text-app-text"
            />
          </View>
        </AppCard>
        <View className="mt-3 rounded-xl bg-app-surface p-4 shadow-sm">
          <Text className="text-[16px] font-semibold text-app-text">Quick Tips</Text>
          <Text className="mt-2 text-[13px] text-app-muted">1. Select a student first, then select a schedule slot.</Text>
          <Text className="mt-1 text-[13px] text-app-muted">2. Use unassign when students switch classes.</Text>
        </View>
      </ScrollView>

      <AppModal open={activeSelector !== null} onClose={() => setActiveSelector(null)} layout="bottom">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-[17px] font-bold text-app-text">{selectorTitle}</Text>
          <TouchableOpacity onPress={() => setActiveSelector(null)}>
            <Text className="text-[14px] font-semibold text-app-primary">{selectorCloseLabel}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {selectorOptions.length === 0 ? (
            <Text className="py-3 text-app-text-subtle">{emptySelectorMessage}</Text>
          ) : (
            selectorOptions.map((option) => {
              const active =
                (selectorType === "student" && studentId === option.value) ||
                (selectorType === "schedule" && scheduleId === option.value);
              return (
                <TouchableOpacity
                  key={option.value}
                  className={`mb-2 rounded-lg border px-3 py-3 ${
                    active ? "border-app-primary bg-app-primary-bg" : "border-app-border-light bg-app-surface"
                  }`}
                  onPress={() => handleSelectOption(option.value)}
                >
                  <Text className={`font-medium ${active ? "text-app-primary-dark" : "text-app-text"}`}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </AppModal>
    </SafeAreaView>
  );
}
