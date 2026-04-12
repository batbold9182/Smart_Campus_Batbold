import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import AnimatedScreen from "../../components/AnimatedScreen";
import { SkeletonList } from "../../components/Skeleton";
import { AppButton, AppInput } from "../../components/ui";
import {
  getFacultyCourseGrades,
  getFacultyGradeCourses,
  saveStudentGrade,
  type FacultyGradeCourse,
  type FacultyGradeCourseDetail,
} from "../../services/facultyServices/gradeService";

export default function Grades() {
  const router = useRouter();
  const [courses, setCourses] = useState<FacultyGradeCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<FacultyGradeCourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingStudentId, setSavingStudentId] = useState<string | null>(null);
  const [draftGrades, setDraftGrades] = useState<Record<string, string>>({});
  const [draftRemarks, setDraftRemarks] = useState<Record<string, string>>({});

  const loadCourses = async () => {
    const nextCourses = await getFacultyGradeCourses();
    setCourses(nextCourses);
  };

  const loadCourseDetail = async (courseId: string) => {
    const detail = await getFacultyCourseGrades(courseId);
    setSelectedCourse(detail);
    setDraftGrades(
      Object.fromEntries(detail.students.map((item) => [item.student.id, item.grade ? String(item.grade.value) : ""]))
    );
    setDraftRemarks(
      Object.fromEntries(detail.students.map((item) => [item.student.id, item.grade?.remarks || ""]))
    );
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        await loadCourses();
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

    const rawValue = draftGrades[studentId]?.trim() || "";
    const numericValue = Number(rawValue);

    if (!rawValue || Number.isNaN(numericValue) || numericValue < 0 || numericValue > 6) {
      Alert.alert("Invalid grade", "Enter a number between 0 and 6.");
      return;
    }

    try {
      setSavingStudentId(studentId);
      await saveStudentGrade(selectedCourse.course.id, studentId, {
        value: numericValue,
        remarks: draftRemarks[studentId] || "",
      });
      await Promise.all([loadCourses(), loadCourseDetail(selectedCourse.course.id)]);
    } catch (error: any) {
      Alert.alert("Unable to save", error?.response?.data?.message || "Please try again.");
    } finally {
      setSavingStudentId(null);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-app-bg" edges={["top"]}>
        <LinearGradient colors={["#2563eb", "#7c3aed"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingHorizontal: 20, paddingVertical: 18, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
          <Text className="text-[22px] font-bold text-white">Grades</Text>
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
        <Text className="text-[22px] font-bold text-white">Grades</Text>
      </LinearGradient>
      <AnimatedScreen>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-5 pt-4">

        {!selectedCourse ? (
          <>
            <View className="mb-4 rounded-xl bg-app-surface p-4 shadow-card">
              <Text className="mb-2 text-[16px] font-semibold text-app-text">Assigned Courses</Text>
              <Text className="text-app-muted">Select a course to publish or update student grades.</Text>
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
                  onPress={() => loadCourseDetail(course.id)}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 pr-3">
                      <Text className="text-[16px] font-semibold text-app-text">{course.title}</Text>
                      <Text className="mt-1 text-app-muted">{course.code} � {course.credits} credits</Text>
                    </View>
                    <Text className="text-[12px] font-semibold text-app-primary">Open</Text>
                  </View>
                  <View className="mt-3 flex-row gap-2">
                    <View className="rounded-full bg-app-primary-bg px-3 py-2">
                      <Text className="text-[12px] font-semibold text-app-primary-dark">{course.enrolledCount} enrolled</Text>
                    </View>
                    <View className="rounded-full bg-app-success-bg-subtle px-3 py-2">
                      <Text className="text-[12px] font-semibold text-app-success">{course.gradedCount} graded</Text>
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

                  <View className="mt-4">
                    <Text className="mb-2 text-[12px] font-semibold uppercase tracking-[0.5px] text-app-muted">Grade</Text>
                    <AppInput
                      keyboardType="numeric"
                      value={draftGrades[item.student.id] || ""}
                      onChangeText={(value) => setDraftGrades((current) => ({ ...current, [item.student.id]: value }))}
                      placeholder="0 - 6"
                      className="rounded-lg border border-app-border px-4 py-3 text-app-text"
                    />
                  </View>

                  <View className="mt-4">
                    <Text className="mb-2 text-[12px] font-semibold uppercase tracking-[0.5px] text-app-muted">Remarks</Text>
                    <AppInput
                      multiline
                      value={draftRemarks[item.student.id] || ""}
                      onChangeText={(value) => setDraftRemarks((current) => ({ ...current, [item.student.id]: value }))}
                      placeholder="Optional feedback"
                      className="min-h-[84px] rounded-lg border border-app-border px-4 py-3 text-app-text"
                      textAlignVertical="top"
                    />
                  </View>

                  {item.grade ? (
                    <Text className="mt-3 text-[12px] text-app-muted">Current saved grade: {item.grade.value}</Text>
                  ) : (
                    <Text className="mt-3 text-[12px] text-app-placeholder">No grade published yet</Text>
                  )}

                  <AppButton
                    className="mt-4"
                    onPress={() => handleSave(item.student.id)}
                    loading={savingStudentId === item.student.id}
                  >
                    Save Grade
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
