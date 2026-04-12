import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import AnimatedScreen from "../../components/AnimatedScreen";
import { SkeletonList } from "../../components/Skeleton";
import { AppButton, AppInput } from "../../components/ui";
import {
  getFacultyAttendanceCourses,
  getFacultyCourseAttendance,
  saveStudentAttendance,
  type AttendanceStatus,
  type FacultyAttendanceCourse,
  type FacultyAttendanceCourseDetail,
} from "../../services/facultyServices/attandanceService";
import { getFacultySchedule, type FacultyScheduleItem } from "../../services/scheduleService";

const ATTENDANCE_STATUSES: AttendanceStatus[] = ["present", "absent", "late", "excused"];

const toTodayDateKey = () => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isValidDateKey = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

const formatStatusLabel = (status: AttendanceStatus) => status.charAt(0).toUpperCase() + status.slice(1);

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const getDayNameFromDateKey = (dateKey: string) => {
  if (!isValidDateKey(dateKey)) {
    return null;
  }

  const parsed = new Date(`${dateKey}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return dayNames[parsed.getUTCDay()];
};

export default function Attendance() {
  const router = useRouter();
  const [courses, setCourses] = useState<FacultyAttendanceCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<FacultyAttendanceCourseDetail | null>(null);
  const [selectedDate, setSelectedDate] = useState(toTodayDateKey());
  const [loading, setLoading] = useState(true);
  const [loadingCourseId, setLoadingCourseId] = useState<string | null>(null);
  const [savingStudentId, setSavingStudentId] = useState<string | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<Record<string, AttendanceStatus>>({});
  const [draftRemarks, setDraftRemarks] = useState<Record<string, string>>({});
  const [facultySchedules, setFacultySchedules] = useState<FacultyScheduleItem[]>([]);

  const loadCourses = async () => {
    const nextCourses = await getFacultyAttendanceCourses();
    setCourses(nextCourses);
  };

  const loadSchedules = async () => {
    const items = await getFacultySchedule();
    setFacultySchedules(items);
  };

  const loadCourseDetail = async (courseId: string, date: string, scheduleId?: string) => {
    setLoadingCourseId(courseId);
    try {
      const detail = await getFacultyCourseAttendance(courseId, date, scheduleId);
      setSelectedCourse(detail);
      setSelectedScheduleId(detail.scheduleId || null);
      setSelectedDate(detail.date);
      setDraftStatus(
        Object.fromEntries(
          detail.students.map((item) => [item.student.id, item.attendance?.status || "present"])
        ) as Record<string, AttendanceStatus>
      );
      setDraftRemarks(
        Object.fromEntries(detail.students.map((item) => [item.student.id, item.attendance?.remarks || ""]))
      );
    } finally {
      setLoadingCourseId(null);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        await Promise.all([loadCourses(), loadSchedules()]);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const handleSave = async (studentId: string) => {
    if (!selectedCourse) {
      return;
    }

    if (!isValidDateKey(selectedDate)) {
      Alert.alert("Invalid date", "Use YYYY-MM-DD format.");
      return;
    }

    try {
      setSavingStudentId(studentId);
      await saveStudentAttendance(selectedCourse.course.id, studentId, {
        status: draftStatus[studentId] || "present",
        date: selectedDate,
        remarks: draftRemarks[studentId] || "",
        scheduleId: selectedScheduleId || undefined,
      });
      await Promise.all([
        loadCourses(),
        loadCourseDetail(selectedCourse.course.id, selectedDate, selectedScheduleId || undefined),
      ]);
    } catch (error: any) {
      Alert.alert("Unable to save", error?.response?.data?.message || "Please try again.");
    } finally {
      setSavingStudentId(null);
    }
  };

  const openCourse = async (courseId: string, scheduleId?: string) => {
    if (!isValidDateKey(selectedDate)) {
      Alert.alert("Invalid date", "Use YYYY-MM-DD format.");
      return;
    }

    try {
      await loadCourseDetail(courseId, selectedDate, scheduleId);
    } catch (error: any) {
      Alert.alert("Unable to load", error?.response?.data?.message || "Please try again.");
    }
  };

  const handleReloadForDate = async () => {
    if (!selectedCourse) {
      return;
    }

    if (!isValidDateKey(selectedDate)) {
      Alert.alert("Invalid date", "Use YYYY-MM-DD format.");
      return;
    }

    try {
      await loadCourseDetail(selectedCourse.course.id, selectedDate, selectedScheduleId || undefined);
    } catch (error: any) {
      Alert.alert("Unable to load", error?.response?.data?.message || "Please try again.");
    }
  };

  const selectedDayName = getDayNameFromDateKey(selectedDate);
  const schedulesForDate = selectedDayName
    ? facultySchedules.filter((item) => item.day === selectedDayName)
    : [];

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-app-bg" edges={["top"]}>
        <LinearGradient colors={["#2563eb", "#7c3aed"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingHorizontal: 20, paddingVertical: 18, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
          <Text className="text-[22px] font-bold text-white">Attendance</Text>
        </LinearGradient>
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <SkeletonList rows={4} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={["top"]}>
      <LinearGradient colors={["#2563eb", "#7c3aed"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingHorizontal: 20, paddingVertical: 18, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
        <Text className="text-[22px] font-bold text-white">Attendance</Text>
      </LinearGradient>
      <AnimatedScreen>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-5 pt-4">

        <View className="mb-4 rounded-xl bg-app-surface p-4 shadow-card">
          <Text className="mb-2 text-[16px] font-semibold text-app-text">Attendance Date</Text>
          <AppInput
            value={selectedDate}
            onChangeText={setSelectedDate}
            placeholder="YYYY-MM-DD"
            className="rounded-lg border border-app-border px-4 py-3 text-app-text"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text className="mt-2 text-[12px] text-app-muted">Use YYYY-MM-DD. Example: 2026-03-22</Text>
        </View>

        <View className="mb-4 rounded-xl bg-app-surface p-4 shadow-card">
          <Text className="mb-2 text-[16px] font-semibold text-app-text">Schedule For Selected Date</Text>
          {!selectedDayName ? (
            <Text className="text-app-muted">Enter a valid date to view schedule.</Text>
          ) : schedulesForDate.length === 0 ? (
            <Text className="text-app-muted">No classes scheduled on {selectedDayName}.</Text>
          ) : (
            schedulesForDate.map((item) => (
              <TouchableOpacity
                key={item._id}
                className="mb-3 rounded-lg border border-app-border-light px-3 py-3"
                onPress={() => item.course?._id && openCourse(item.course._id, item._id)}
                disabled={!item.course?._id}
              >
                <Text className="text-[15px] font-semibold text-app-text">
                  {item.course?.title || item.course?.name || "Untitled Course"}
                </Text>
                <Text className="mt-1 text-app-muted">
                  {item.course?.code || "No code"} � {item.startTime} - {item.endTime} � Room {item.room}
                </Text>
                <Text className="mt-2 text-[12px] font-semibold text-app-primary">Open attendance</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {!selectedCourse ? (
          <>
            <View className="mb-4 rounded-xl bg-app-surface p-4 shadow-card">
              <Text className="mb-2 text-[16px] font-semibold text-app-text">Assigned Courses</Text>
              <Text className="text-app-muted">Choose a course and manually mark each student.</Text>
            </View>

            {courses.length === 0 ? (
              <View className="mb-4 rounded-xl bg-app-surface p-4 shadow-card">
                <Text className="text-app-muted">No courses assigned yet.</Text>
              </View>
            ) : (
              courses.map((course) => (
                <TouchableOpacity
                  key={course.id}
                  className="mb-4 rounded-xl bg-app-surface p-4 shadow-card"
                  onPress={() => openCourse(course.id)}
                  disabled={loadingCourseId === course.id}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 pr-3">
                      <Text className="text-[16px] font-semibold text-app-text">{course.title}</Text>
                      <Text className="mt-1 text-app-muted">{course.code} � {course.credits} credits</Text>
                    </View>
                    <Text className="text-[12px] font-semibold text-app-primary">
                      {loadingCourseId === course.id ? "Loading..." : "Open"}
                    </Text>
                  </View>
                  <View className="mt-3 flex-row gap-2">
                    <View className="rounded-full bg-app-primary-bg px-3 py-2">
                      <Text className="text-[12px] font-semibold text-app-primary-dark">{course.enrolledCount} enrolled</Text>
                    </View>
                    <View className="rounded-full bg-app-success-bg-subtle px-3 py-2">
                      <Text className="text-[12px] font-semibold text-app-success">
                        {course.markedTodayCount} marked today
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        ) : (
          <>
            <View className="mb-4 rounded-xl bg-app-surface p-4 shadow-card">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-[18px] font-semibold text-app-text">{selectedCourse.course.title}</Text>
                  <Text className="mt-1 text-app-muted">{selectedCourse.course.code} � {selectedCourse.course.credits} credits</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedCourse(null)} className="rounded-full bg-app-primary-bg px-3 py-2">
                  <Text className="font-semibold text-app-primary">Courses</Text>
                </TouchableOpacity>
              </View>

              {selectedScheduleId ? (
                <Text className="mt-2 text-[12px] text-app-primary">Session-specific attendance mode</Text>
              ) : null}

              <TouchableOpacity onPress={handleReloadForDate} className="mt-3 self-start rounded-lg bg-app-border-light px-3 py-2">
                <Text className="font-semibold text-app-text-secondary">Reload For Date</Text>
              </TouchableOpacity>
            </View>

            {selectedCourse.students.length === 0 ? (
              <View className="mb-4 rounded-xl bg-app-surface p-4 shadow-card">
                <Text className="text-app-muted">No enrolled students in this course yet.</Text>
              </View>
            ) : (
              selectedCourse.students.map((item) => (
                <View key={item.student.id} className="mb-4 rounded-xl bg-app-surface p-4 shadow-card">
                  <Text className="text-[16px] font-semibold text-app-text">{item.student.name}</Text>
                  <Text className="mt-1 text-app-muted">{item.student.program || "Program not set"}{item.student.yearLevel ? ` � Year ${item.student.yearLevel}` : ""}</Text>
                  <Text className="mt-1 text-app-placeholder">{item.student.email}</Text>

                  <Text className="mb-2 mt-4 text-[12px] font-semibold uppercase tracking-[0.5px] text-app-muted">Status</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {ATTENDANCE_STATUSES.map((status) => {
                      const isActive = (draftStatus[item.student.id] || "present") === status;
                      return (
                        <TouchableOpacity
                          key={status}
                          onPress={() => setDraftStatus((current) => ({ ...current, [item.student.id]: status }))}
                          className={`rounded-full px-3 py-2 ${isActive ? "bg-blue-500" : "bg-app-border-light"}`}
                        >
                          <Text className={`text-[12px] font-semibold ${isActive ? "text-white" : "text-app-text-secondary"}`}>
                            {formatStatusLabel(status)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View className="mt-4">
                    <Text className="mb-2 text-[12px] font-semibold uppercase tracking-[0.5px] text-app-muted">Remarks</Text>
                    <AppInput
                      multiline
                      value={draftRemarks[item.student.id] || ""}
                      onChangeText={(value) => setDraftRemarks((current) => ({ ...current, [item.student.id]: value }))}
                      placeholder="Optional note"
                      className="min-h-[84px] rounded-lg border border-app-border px-4 py-3 text-app-text"
                      textAlignVertical="top"
                    />
                  </View>

                  {item.attendance ? (
                    <Text className="mt-3 text-[12px] text-app-muted">
                      Current saved attendance: {formatStatusLabel(item.attendance.status)}
                    </Text>
                  ) : (
                    <Text className="mt-3 text-[12px] text-app-placeholder">No attendance saved for this date</Text>
                  )}

                  <AppButton
                    className="mt-4"
                    onPress={() => handleSave(item.student.id)}
                    loading={savingStudentId === item.student.id}
                  >
                    Save Attendance
                  </AppButton>
                </View>
              ))
            )}
          </>
        )}

        <AppButton onPress={() => router.push("/faculty/dashboard")}>
          Back to Dashboard
        </AppButton>
      </ScrollView>
      </AnimatedScreen>
    </SafeAreaView>
  );
}
