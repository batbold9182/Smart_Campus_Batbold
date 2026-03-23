import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import api from "../../config/clientAPI";
import { useRouter } from "expo-router";
import { adminStyles } from "../../styles/adminStyles";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminEnrollScreen() {
  const ENROLLMENTS_LIMIT = 20;
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [enrollmentsPage, setEnrollmentsPage] = useState(1);
  const [enrollmentsTotalPages, setEnrollmentsTotalPages] = useState(1);
  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [viewCourseId, setViewCourseId] = useState("");
  const [showEnrollments, setShowEnrollments] = useState(false);
  const [activeSelector, setActiveSelector] = useState<"student" | "course" | "filterCourse" | null>(null);
  const [lastSelector, setLastSelector] = useState<"student" | "course" | "filterCourse" | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [enrollError, setEnrollError] = useState("");
  const [enrollSuccess, setEnrollSuccess] = useState("");

  const loadEnrollments = useCallback(async (page = 1) => {
    const enrollmentsRes = await api.get("/api/admin/enrollments", {
      params: { page, limit: ENROLLMENTS_LIMIT },
    });

    if (Array.isArray(enrollmentsRes.data)) {
      setEnrollments(enrollmentsRes.data);
      setEnrollmentsPage(1);
      setEnrollmentsTotalPages(1);
      return;
    }

    const items = enrollmentsRes.data?.items || [];
    const totalPages = Math.max(Number(enrollmentsRes.data?.pagination?.totalPages) || 1, 1);
    setEnrollments(items);
    setEnrollmentsPage(page);
    setEnrollmentsTotalPages(totalPages);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setInitialLoading(true);
      setLoadError("");

      const studentsRes = await api.get("/api/admin/students");
      const coursesRes = await api.get("/api/admin/courses");

      setStudents(studentsRes.data || []);
      setCourses(coursesRes.data || []);
      await loadEnrollments(1);
    } catch (err: any) {
      console.error("Data loading error:", err);

      let message = "Failed to load data";
      if (err.response?.status === 401) message = "Session expired. Please login again.";
      else if (err.response?.status === 403) message = "Access denied. Admin only.";
      else if (err.response?.data?.message) message = err.response.data.message;
      else if (err.message) message = err.message;

      setLoadError(message);
      Alert.alert("Load Error", message);
    } finally {
      setInitialLoading(false);
    }
  }, [loadEnrollments]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (activeSelector !== null) {
      setLastSelector(activeSelector);
    }
  }, [activeSelector]);

  const handleEnroll = async () => {
    setEnrollError("");
    setEnrollSuccess("");

    if (!studentId || !courseId) {
      const message = "Please select student and course";
      setEnrollError(message);
      Alert.alert("Validation", message);
      return;
    }

    try {
      setLoading(true);
      await api.post("/api/admin/enroll", {
        studentId,
        courseId
      });

      setEnrollSuccess("Student enrolled successfully");
      Alert.alert("Success", "Student enrolled successfully");
      console.log("Enrollment successful for studentId:", studentId, "courseId:", courseId);

      await loadEnrollments(1);

      setStudentId("");
      setCourseId("");
    } catch (err: any) {
      console.error("Enrollment error:", {
        status: err.response?.status,
        message: err.response?.data?.message || err.message,
        payload: { studentId, courseId }
      });

      const backendMessage = err.response?.data?.message || "";
      const isAlreadyEnrolled =
        err.response?.status === 400 &&
        backendMessage.toLowerCase().includes("already enrolled");

      const errorMessage = isAlreadyEnrolled
        ? "Student is already enrolled in this course"
        : "Enrollment failed. Please try again.";

      setEnrollError(errorMessage);

      Alert.alert(
        "Error",
        errorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async (enrollmentId: string) => {
    setEnrollError("");
    setEnrollSuccess("");

    try {
      setLoading(true);
      await api.delete(`/api/admin/enrollments/${enrollmentId}`);

      await loadEnrollments(enrollmentsPage);
      setEnrollSuccess("Student unenrolled successfully");
    } catch (err: any) {
      const backendMessage = err.response?.data?.message || "";
      const errorMessage = backendMessage.toLowerCase().includes("not found")
        ? "Student is not enrolled in this course"
        : "Unenroll failed. Please try again.";

      setEnrollError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredEnrollments = viewCourseId
    ? enrollments.filter((enrollment) => enrollment.course?._id === viewCourseId)
    : enrollments;

  const selectedStudent = students.find((s) => s._id === studentId);
  const selectedCourse = courses.find((c) => c._id === courseId);
  const selectedFilterCourse = courses.find((c) => c._id === viewCourseId);

  const selectedStudentLabel = selectedStudent
    ? `${selectedStudent.name} (${selectedStudent.email})`
    : "Choose student";

  const selectedCourseLabel = selectedCourse
    ? `${selectedCourse.title} (${selectedCourse.code})`
    : "Choose course";

  const selectedFilterCourseLabel = selectedFilterCourse
    ? `${selectedFilterCourse.title} (${selectedFilterCourse.code})`
    : "All Courses";

  const selectorType = activeSelector ?? lastSelector;

  const selectorTitle =
    selectorType === "student"
      ? "Select Student"
      : selectorType === "course"
      ? "Select Course"
      : selectorType === "filterCourse"
      ? "Filter by Course"
      : "";

  const selectorOptions =
    selectorType === "student"
      ? students.map((s) => ({
          label: `${s.name} (${s.email})`,
          value: s._id,
        }))
      : selectorType === "course"
      ? courses.map((c) => ({
          label: `${c.title} (${c.code})`,
          value: c._id,
        }))
      : selectorType === "filterCourse"
      ? [
          { label: "All Courses", value: "" },
          ...courses.map((c) => ({
            label: `${c.title} (${c.code})`,
            value: c._id,
          })),
        ]
      : [];

  const emptySelectorMessage =
    selectorType === "student"
      ? "No students available."
      : selectorType === "course"
      ? "No courses available."
      : selectorType === "filterCourse"
      ? "No courses available for filtering."
      : "No options available.";

  const selectorCloseLabel =
    selectorType === "student"
      ? "Close Student List"
      : selectorType === "course"
      ? "Close Course List"
      : selectorType === "filterCourse"
      ? "Close Course Filter"
      : "Close";

  const handleSelectorPick = (value: string) => {
    if (activeSelector === "student") {
      setStudentId(value);
    } else if (activeSelector === "course") {
      setCourseId(value);
    } else if (activeSelector === "filterCourse") {
      setViewCourseId(value);
    }
    setActiveSelector(null);
  };

  if (initialLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-app-bg p-5">
        <Text className="mb-4 text-2xl font-bold text-app-text">🎓 Enroll Student</Text>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (loadError) {
    return (
      <View className="flex-1 items-center justify-center bg-app-bg p-5">
        <Text className="mb-4 text-2xl font-bold text-app-text">Enroll Student</Text>
        <Text className="mb-3 text-[#c62828]">{loadError}</Text>
        <TouchableOpacity className="rounded-lg bg-blue-500 px-4 py-2" onPress={loadData}>
          <Text className="font-semibold text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    
    <SafeAreaView className="flex-1 bg-app-bg" edges={["top"]}>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-6">
        <View className={adminStyles.card}>
        <Text className="text-[24px] font-bold text-app-text">Enroll Student</Text>
        <Text className="mb-5 mt-1 text-[13px] text-app-muted">
          Assign students to courses and manage active enrollments.
        </Text>

      {!!enrollError && <Text className="mb-3 text-[#c62828]">{enrollError}</Text>}
      {!!enrollSuccess && <Text className="mb-3 text-[#2e7d32]">{enrollSuccess}</Text>}

      <Text className="mb-2 text-[14px] font-semibold text-app-text">Select Student</Text>
      <TouchableOpacity
        className={`mb-3 min-h-[50px] flex-row items-center justify-between rounded-xl border px-3 ${
          !loading && students.length > 0 ? "border-app-border bg-app-surface" : "border-[#e5e7eb] bg-[#f3f4f6]"
        }`}
        onPress={() => setActiveSelector("student")}
        disabled={loading || students.length === 0}
      >
        <Text className={studentId ? "text-app-text" : "text-app-muted"}>{selectedStudentLabel}</Text>
        <Text className="text-[18px] text-app-muted">▾</Text>
      </TouchableOpacity>

      <Text className="mb-2 text-[14px] font-semibold text-app-text">Select Course</Text>
      <TouchableOpacity
        className={`mb-3 min-h-[50px] flex-row items-center justify-between rounded-xl border px-3 ${
          !loading && courses.length > 0 ? "border-app-border bg-app-surface" : "border-[#e5e7eb] bg-[#f3f4f6]"
        }`}
        onPress={() => setActiveSelector("course")}
        disabled={loading || courses.length === 0}
      >
        <Text className={courseId ? "text-app-text" : "text-app-muted"}>{selectedCourseLabel}</Text>
        <Text className="text-[18px] text-app-muted">▾</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <TouchableOpacity
            className={`items-center rounded-xl px-4 py-3 ${students.length === 0 || courses.length === 0 ? "bg-[#93c5fd]" : "bg-blue-500"}`}
            onPress={handleEnroll}
            disabled={students.length === 0 || courses.length === 0}
          >
            <Text className="font-semibold text-white">Enroll Student</Text>
          </TouchableOpacity>
          <View className="h-[10px]" />
          <TouchableOpacity
            className="items-center rounded-xl border border-app-border bg-white px-4 py-3"
            onPress={() => {
              setShowEnrollments((prev) => !prev);
            }}
          >
            <Text className="font-semibold text-app-text">
              {showEnrollments ? "Hide Enrollments List" : "Show Enrollments List"}
            </Text>
          </TouchableOpacity>
        </>
      )}

      {showEnrollments && (
        <>
          <Text className="mb-2 mt-6 text-[20px] font-bold text-app-text">Enrollments List</Text>
          <Text className="mb-2 text-[14px] font-semibold text-app-text">View by Course</Text>
          <TouchableOpacity
            className={`mb-3 min-h-[50px] flex-row items-center justify-between rounded-xl border px-3 ${
              courses.length > 0 ? "border-app-border bg-app-surface" : "border-[#e5e7eb] bg-[#f3f4f6]"
            }`}
            onPress={() => setActiveSelector("filterCourse")}
            disabled={courses.length === 0}
          >
            <Text className={viewCourseId ? "text-app-text" : "text-app-muted"}>{selectedFilterCourseLabel}</Text>
            <Text className="text-[18px] text-app-muted">▾</Text>
          </TouchableOpacity>

          {filteredEnrollments.length === 0 ? (
            <Text className="mb-3 text-app-muted">No enrollments found</Text>
          ) : (
            filteredEnrollments.map((enrollment) => (
              <View key={enrollment._id} className="mb-3 gap-2 rounded-xl border border-app-border bg-white p-[10px]">
                <Text className="text-[14px]">
                  {enrollment.student?.name || "Unknown Student"} → {enrollment.course?.title || "Unknown Course"}
                </Text>
                <TouchableOpacity
                  className="items-center rounded-lg bg-red-500 px-3 py-2"
                  onPress={() => handleUnenroll(enrollment._id)}
                  disabled={loading}
                >
                  <Text className="font-semibold text-white">Unenroll</Text>
                </TouchableOpacity>
              </View>
            ))
          )}

          <View className="mb-3 mt-2 flex-row items-center justify-between">
            <TouchableOpacity
              className={`rounded-lg px-4 py-2 ${loading || enrollmentsPage <= 1 ? "bg-[#cbd5e1]" : "bg-blue-500"}`}
              onPress={() => loadEnrollments(enrollmentsPage - 1)}
              disabled={loading || enrollmentsPage <= 1}
            >
              <Text className="font-semibold text-white">Previous</Text>
            </TouchableOpacity>
            <Text className="text-[13px] text-app-text">Page {enrollmentsPage} / {enrollmentsTotalPages}</Text>
            <TouchableOpacity
              className={`rounded-lg px-4 py-2 ${loading || enrollmentsPage >= enrollmentsTotalPages ? "bg-[#cbd5e1]" : "bg-blue-500"}`}
              onPress={() => loadEnrollments(enrollmentsPage + 1)}
              disabled={loading || enrollmentsPage >= enrollmentsTotalPages}
            >
              <Text className="font-semibold text-white">Next</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <TouchableOpacity
         className="items-center rounded-xl border border-app-border bg-white px-4 py-3"
         onPress={() => router.push("../dashboard")}
      >
        <Text className="font-semibold text-app-text">Back to Dashboard</Text>
      </TouchableOpacity>
      </View>
    </ScrollView>

    <Modal transparent visible={activeSelector !== null} animationType="fade" onRequestClose={() => setActiveSelector(null)}>
      <Pressable className="flex-1 items-center justify-end bg-black/40 px-4 pb-6" onPress={() => setActiveSelector(null)}>
        <Pressable className="max-h-[70%] w-full rounded-2xl bg-white p-4" onPress={() => {}}>
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-[17px] font-bold text-[#0f172a]">{selectorTitle}</Text>
            <TouchableOpacity onPress={() => setActiveSelector(null)}>
              <Text className="text-[14px] font-semibold text-[#2563eb]">{selectorCloseLabel}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {selectorOptions.length === 0 ? (
              <Text className="py-3 text-[#64748b]">{emptySelectorMessage}</Text>
            ) : (
              selectorOptions.map((option) => {
                const active =
                  (activeSelector === "student" && studentId === option.value) ||
                  (activeSelector === "course" && courseId === option.value) ||
                  (activeSelector === "filterCourse" && viewCourseId === option.value);
                return (
                  <TouchableOpacity
                    key={`${option.value || "all"}-${option.label}`}
                    className={`mb-2 rounded-lg border px-3 py-3 ${
                      active ? "border-[#2563eb] bg-[#eff6ff]" : "border-[#e5e7eb] bg-white"
                    }`}
                    onPress={() => handleSelectorPick(option.value)}
                  >
                    <Text className={`font-medium ${active ? "text-[#1d4ed8]" : "text-[#111827]"}`}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
    </SafeAreaView>
  );
}
