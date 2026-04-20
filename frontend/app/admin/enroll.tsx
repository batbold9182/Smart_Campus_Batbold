import { useCallback, useEffect, useState } from "react";
import logger from "../../utils/logger";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { SkeletonList } from "../../components/Skeleton";
import { AppButton, AppCard, AppModal } from "../../components/ui";
import {
  enrollStudent,
  getEnrollments,
  getUsers,
  unenrollStudent,
} from "../../services/adminServices/adminService";
import { getAllCourses } from "../../services/courseService";

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
    const data = await getEnrollments(page, ENROLLMENTS_LIMIT);

    if (Array.isArray(data)) {
      setEnrollments(data);
      setEnrollmentsPage(1);
      setEnrollmentsTotalPages(1);
      return;
    }

    const items = data?.items || [];
    const totalPages = Math.max(Number(data?.pagination?.totalPages) || 1, 1);
    setEnrollments(items);
    setEnrollmentsPage(page);
    setEnrollmentsTotalPages(totalPages);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setInitialLoading(true);
      setLoadError("");

      const studentsData = await getUsers(1, "student", 100);
      const coursesData = await getAllCourses();

      setStudents(studentsData.users || []);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
      await loadEnrollments(1);
    } catch (err: any) {
      logger.error("Data loading error:", err);

      let message = "Failed to load data";
      if (err.response?.status === 401) message = "Session expired. Please login again.";
      else if (err.response?.status === 403) message = "Access denied. Admin only.";
      else if (err.response?.data?.message) message = err.response.data.message;
      else if (err.message) message = err.message;

      setLoadError(message);
      Toast.show({ type: "error", text1: message });
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
      setEnrollError("Please select student and course");
      return;
    }

    try {
      setLoading(true);
      await enrollStudent(studentId, courseId);

      setEnrollSuccess("Student enrolled successfully");
      Toast.show({ type: "success", text1: "Student enrolled successfully" });
      logger.log("Enrollment successful for studentId:", studentId, "courseId:", courseId);

      await loadEnrollments(1);

      setStudentId("");
      setCourseId("");
    } catch (err: any) {
      logger.error("Enrollment error:", {
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

      Toast.show({ type: "error", text1: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async (enrollmentId: string) => {
    setEnrollError("");
    setEnrollSuccess("");

    try {
      setLoading(true);
      await unenrollStudent(enrollmentId);

      await loadEnrollments(enrollmentsPage);
      setEnrollSuccess("Student unenrolled successfully");
    } catch (err: any) {
      const backendMessage = err.response?.data?.message || "";
      const errorMessage = backendMessage.toLowerCase().includes("not found")
        ? "Student is not enrolled in this course"
        : "Unenroll failed. Please try again.";

      setEnrollError(errorMessage);
      Toast.show({ type: "error", text1: errorMessage });
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
      <View className="flex-1 bg-app-bg p-5">
        <Text className="mb-4 text-2xl font-bold text-app-text">🎓 Enroll Student</Text>
        <SkeletonList rows={4} />
      </View>
    );
  }

  if (loadError) {
    return (
      <View className="flex-1 items-center justify-center bg-app-bg p-5">
        <Text className="mb-4 text-2xl font-bold text-app-text">Enroll Student</Text>
        <Text className="mb-3 text-app-error">{loadError}</Text>
        <TouchableOpacity className="rounded-lg bg-app-primary px-4 py-2" onPress={loadData}>
          <Text className="font-semibold text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    
    <SafeAreaView className="flex-1 bg-app-bg" edges={["top"]}>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-6">
        <AppCard className="rounded-2xl border border-app-border-light bg-app-surface p-4 shadow-sm">
        <Text className="text-[24px] font-bold text-app-text">Enroll Student</Text>
        <Text className="mb-5 mt-1 text-[13px] text-app-muted">
          Assign students to courses and manage active enrollments.
        </Text>

      {!!enrollError && <Text className="mb-3 text-app-error">{enrollError}</Text>}
      {!!enrollSuccess && <Text className="mb-3 text-app-success">{enrollSuccess}</Text>}

      <Text className="mb-2 text-[14px] font-semibold text-app-text">Select Student</Text>
      <TouchableOpacity
        className={`mb-3 min-h-[50px] flex-row items-center justify-between rounded-xl border px-3 ${
          !loading && students.length > 0 ? "border-app-border bg-app-surface" : "border-app-border-light bg-app-bg-muted"
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
          !loading && courses.length > 0 ? "border-app-border bg-app-surface" : "border-app-border-light bg-app-bg-muted"
        }`}
        onPress={() => setActiveSelector("course")}
        disabled={loading || courses.length === 0}
      >
        <Text className={courseId ? "text-app-text" : "text-app-muted"}>{selectedCourseLabel}</Text>
        <Text className="text-[18px] text-app-muted">▾</Text>
      </TouchableOpacity>

      {loading ? (
        <View className="items-center py-4">
          <Text className="text-app-muted">Processing...</Text>
        </View>
      ) : (
        <>
          <AppButton
            title="Enroll Student"
            onPress={handleEnroll}
            loading={loading}
            className={`items-center rounded-xl px-4 py-3 ${students.length === 0 || courses.length === 0 ? "bg-app-primary-loading" : "bg-app-primary"}`}
            textClassName="font-semibold text-white"
          />
          <View className="h-[10px]" />
          <AppButton
            title={showEnrollments ? "Hide Enrollments List" : "Show Enrollments List"}
            variant="outline"
            onPress={() => {
              setShowEnrollments((prev) => !prev);
            }}
            className="items-center rounded-xl border border-app-border bg-app-surface px-4 py-3"
            textClassName="font-semibold text-app-text"
          />
        </>
      )}

      {showEnrollments && (
        <>
          <Text className="mb-2 mt-6 text-[20px] font-bold text-app-text">Enrollments List</Text>
          <Text className="mb-2 text-[14px] font-semibold text-app-text">View by Course</Text>
          <TouchableOpacity
            className={`mb-3 min-h-[50px] flex-row items-center justify-between rounded-xl border px-3 ${
              courses.length > 0 ? "border-app-border bg-app-surface" : "border-app-border-light bg-app-bg-muted"
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
              <AppCard key={enrollment._id} variant="bordered" className="mb-3 gap-2 rounded-xl border border-app-border bg-app-surface p-[10px]">
                <Text className="text-[14px]">
                  {enrollment.student?.name || "Unknown Student"} → {enrollment.course?.title || "Unknown Course"}
                </Text>
                <AppButton
                  title="Unenroll"
                  variant="danger"
                  loading={loading}
                  onPress={() => handleUnenroll(enrollment._id)}
                  className="items-center rounded-lg bg-app-danger px-3 py-2"
                  textClassName="font-semibold text-white"
                />
              </AppCard>
            ))
          )}

          <View className="mb-3 mt-2 flex-row items-center justify-between">
            <TouchableOpacity
              className={`rounded-lg px-4 py-2 ${loading || enrollmentsPage <= 1 ? "bg-app-disabled" : "bg-app-primary"}`}
              onPress={() => loadEnrollments(enrollmentsPage - 1)}
              disabled={loading || enrollmentsPage <= 1}
            >
              <Text className="font-semibold text-white">Previous</Text>
            </TouchableOpacity>
            <Text className="text-[13px] text-app-text">Page {enrollmentsPage} / {enrollmentsTotalPages}</Text>
            <TouchableOpacity
              className={`rounded-lg px-4 py-2 ${loading || enrollmentsPage >= enrollmentsTotalPages ? "bg-app-disabled" : "bg-app-primary"}`}
              onPress={() => loadEnrollments(enrollmentsPage + 1)}
              disabled={loading || enrollmentsPage >= enrollmentsTotalPages}
            >
              <Text className="font-semibold text-white">Next</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <AppButton
        title="Back to Dashboard"
        variant="outline"
        onPress={() => router.push("/admin/dashboard")}
        className="items-center rounded-xl border border-app-border bg-app-surface px-4 py-3"
        textClassName="font-semibold text-app-text"
      />
      </AppCard>
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
              (activeSelector === "student" && studentId === option.value) ||
              (activeSelector === "course" && courseId === option.value) ||
              (activeSelector === "filterCourse" && viewCourseId === option.value);
            return (
              <TouchableOpacity
                key={`${option.value || "all"}-${option.label}`}
                className={`mb-2 rounded-lg border px-3 py-3 ${
                  active ? "border-app-primary bg-app-primary-bg" : "border-app-border-light bg-app-surface"
                }`}
                onPress={() => handleSelectorPick(option.value)}
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
