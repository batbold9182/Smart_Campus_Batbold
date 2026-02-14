import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  ActivityIndicator,
  ScrollView
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import api from "../../config/clientAPI";
import { useRouter } from "expo-router";

export default function AdminEnrollScreen() {
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [viewCourseId, setViewCourseId] = useState("");
  const [showEnrollments, setShowEnrollments] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [enrollError, setEnrollError] = useState("");
  const [enrollSuccess, setEnrollSuccess] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setInitialLoading(true);
      setLoadError("");

      const studentsRes = await api.get("/api/admin/students");
      const coursesRes = await api.get("/api/admin/courses");
      const enrollmentsRes = await api.get("/api/admin/enrollments");

      setStudents(studentsRes.data || []);
      setCourses(coursesRes.data || []);
      setEnrollments(enrollmentsRes.data || []);
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
  };

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

      const enrollmentsRes = await api.get("/api/admin/enrollments");
      setEnrollments(enrollmentsRes.data || []);

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

      setEnrollments((prev) => prev.filter((enrollment) => enrollment._id !== enrollmentId));
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

  if (initialLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🎓 Enroll Student</Text>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🎓 Enroll Student</Text>
        <Text style={styles.errorText}>{loadError}</Text>
        <Button title="Retry" onPress={loadData} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
      <Text style={styles.title}>🎓 Enroll Student</Text>

      {!!enrollError && <Text style={styles.errorText}>{enrollError}</Text>}
      {!!enrollSuccess && <Text style={styles.successText}>{enrollSuccess}</Text>}

      <Text style={styles.label}>Select Student</Text>
      <Picker
        selectedValue={studentId}
        onValueChange={(value) => setStudentId(value)}
        enabled={!loading && students.length > 0}
      >
        <Picker.Item label="-- Choose Student --" value="" />
        {students.map((s) => (
          <Picker.Item
            key={s._id}
            label={`${s.name} (${s.email})`}
            value={s._id}
          />
        ))}
      </Picker>

      <Text style={styles.label}>Select Course</Text>
      <Picker
        selectedValue={courseId}
        onValueChange={(value) => setCourseId(value)}
        enabled={!loading && courses.length > 0}
      >
        <Picker.Item label="-- Choose Course --" value="" />
        {courses.map((c) => (
          <Picker.Item
            key={c._id}
            label={`${c.title} (${c.code})`}
            value={c._id}
          />
        ))}
      </Picker>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <Button
            title="Enroll Student"
            onPress={handleEnroll}
            disabled={students.length === 0 || courses.length === 0}
          />
          <View style={styles.buttonSpacing} />
          <Button
            title={showEnrollments ? "Hide Enrollments List" : "Show Enrollments List"}
            onPress={() => {
              setShowEnrollments((prev) => !prev);
            }}
          />
        </>
      )}

      {showEnrollments && (
        <>
          <Text style={styles.sectionTitle}>Enrollments List</Text>
          <Text style={styles.label}>View by Course</Text>
          <Picker
            selectedValue={viewCourseId}
            onValueChange={(value) => setViewCourseId(value)}
            enabled={courses.length > 0}
          >
            <Picker.Item label="-- All Courses --" value="" />
            {courses.map((course) => (
              <Picker.Item
                key={course._id}
                label={`${course.title} (${course.code})`}
                value={course._id}
              />
            ))}
          </Picker>

          {filteredEnrollments.length === 0 ? (
            <Text style={styles.emptyText}>No enrollments found</Text>
          ) : (
            filteredEnrollments.map((enrollment) => (
              <View key={enrollment._id} style={styles.enrollmentItem}>
                <Text style={styles.enrollmentText}>
                  {enrollment.student?.name || "Unknown Student"} → {enrollment.course?.title || "Unknown Course"}
                </Text>
                <Button
                  title="Unenroll"
                  color="#c62828"
                  onPress={() => handleUnenroll(enrollment._id)}
                  disabled={loading}
                />
              </View>
            ))
          )}
        </>
      )}

      <Button
         title  = "Back to Dashboard"
         onPress={() => router.push("../dashboard")}
         />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  errorText: {
    color: "#c62828",
    marginBottom: 12,
  },
  successText: {
    color: "#2e7d32",
    marginBottom: 12,
  },
  buttonSpacing: {
    height: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 10,
  },
  emptyText: {
    color: "#666",
    marginBottom: 10,
  },
  enrollmentItem: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    gap: 8,
  },
  enrollmentText: {
    fontSize: 14,
  },
});
