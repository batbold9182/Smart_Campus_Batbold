import { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import AnimatedScreen from "../../components/AnimatedScreen";
import { SkeletonList } from "../../components/Skeleton";
import { AppButton, AppInput } from "../../components/ui";
import {
  createCourseAssignment,
  deleteCourseAssignment,
  downloadAssignmentSubmission,
  getFacultyAssignmentSubmissions,
  getFacultyAssignmentCourses,
  getFacultyCourseAssignments,
  getAssignmentSubmissionDownloadUrl,
  saveFacultyAssignmentReview,
  type AssignmentRecord,
  type FacultyAssignmentSubmissionDetail,
  type FacultyAssignmentCourse,
  type FacultyAssignmentCourseDetail,
} from "../../services/facultyServices/assignmentService";

const toDateInputValue = (date = new Date()) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isValidDateKey = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

const formatReadableDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getAssignmentStatus = (dueDate: string) => {
  const due = new Date(dueDate);
  const today = new Date();
  const dueKey = toDateInputValue(due);
  const todayKey = toDateInputValue(today);

  if (Number.isNaN(due.getTime())) {
    return { label: "Unknown", tone: "text-app-muted", chip: "bg-app-bg-muted" };
  }

  if (dueKey < todayKey) {
    return { label: "Overdue", tone: "text-app-error", chip: "bg-app-error-bg" };
  }

  if (dueKey === todayKey) {
    return { label: "Due Today", tone: "text-app-warning", chip: "bg-app-warning-bg" };
  }

  return { label: "Upcoming", tone: "text-app-success", chip: "bg-app-success-bg" };
};

export default function Assignments() {
  const router = useRouter();
  const [courses, setCourses] = useState<FacultyAssignmentCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<FacultyAssignmentCourseDetail | null>(null);
  const [selectedAssignmentDetail, setSelectedAssignmentDetail] = useState<FacultyAssignmentSubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingCourseId, setLoadingCourseId] = useState<string | null>(null);
  const [loadingAssignmentId, setLoadingAssignmentId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingAssignmentId, setDeletingAssignmentId] = useState<string | null>(null);
  const [savingSubmissionId, setSavingSubmissionId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [draftDueDate, setDraftDueDate] = useState(toDateInputValue());
  const [draftMaxPoints, setDraftMaxPoints] = useState("100");
  const [draftScores, setDraftScores] = useState<Record<string, string>>({});
  const [draftFeedback, setDraftFeedback] = useState<Record<string, string>>({});

  const loadCourses = async () => {
    const nextCourses = await getFacultyAssignmentCourses();
    setCourses(nextCourses);
  };

  const resetDraft = () => {
    setDraftTitle("");
    setDraftDescription("");
    setDraftDueDate(toDateInputValue());
    setDraftMaxPoints("100");
  };

  const openCourse = async (courseId: string) => {
    try {
      setLoadingCourseId(courseId);
      const detail = await getFacultyCourseAssignments(courseId);
      setSelectedCourse(detail);
      setSelectedAssignmentDetail(null);
    } catch (error: any) {
      Alert.alert("Unable to load", error?.response?.data?.message || "Please try again.");
    } finally {
      setLoadingCourseId(null);
    }
  };

  const hydrateSubmissionDrafts = (detail: FacultyAssignmentSubmissionDetail) => {
    setDraftScores(
      Object.fromEntries(
        detail.submissions.map((submission) => [submission.id, submission.score === null ? "" : String(submission.score)])
      )
    );
    setDraftFeedback(
      Object.fromEntries(detail.submissions.map((submission) => [submission.id, submission.feedback || ""]))
    );
  };

  const openAssignmentSubmissions = async (assignmentId: string) => {
    if (!selectedCourse) {
      return;
    }

    try {
      setLoadingAssignmentId(assignmentId);
      const detail = await getFacultyAssignmentSubmissions(selectedCourse.course.id, assignmentId);
      setSelectedAssignmentDetail(detail);
      hydrateSubmissionDrafts(detail);
    } catch (error: any) {
      Alert.alert("Unable to load", error?.response?.data?.message || "Please try again.");
    } finally {
      setLoadingAssignmentId(null);
    }
  };

  const refreshSelectedCourse = async (courseId: string) => {
    const detail = await getFacultyCourseAssignments(courseId);
    setSelectedCourse(detail);
  };

  const refreshSelectedAssignment = async (courseId: string, assignmentId: string) => {
    const detail = await getFacultyAssignmentSubmissions(courseId, assignmentId);
    setSelectedAssignmentDetail(detail);
    hydrateSubmissionDrafts(detail);
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        await loadCourses();
      } catch (error: any) {
        Alert.alert("Unable to load", error?.response?.data?.message || "Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const handleCreate = async () => {
    if (!selectedCourse) {
      return;
    }

    const title = draftTitle.trim();
    const maxPoints = Number(draftMaxPoints);

    if (!title) {
      Alert.alert("Missing title", "Enter an assignment title.");
      return;
    }

    if (!isValidDateKey(draftDueDate)) {
      Alert.alert("Invalid due date", "Use YYYY-MM-DD format.");
      return;
    }

    if (!Number.isFinite(maxPoints) || maxPoints < 0) {
      Alert.alert("Invalid max points", "Enter a valid number greater than or equal to 0.");
      return;
    }

    try {
      setCreating(true);
      await createCourseAssignment(selectedCourse.course.id, {
        title,
        description: draftDescription.trim(),
        dueDate: draftDueDate,
        maxPoints,
      });
      resetDraft();
      await Promise.all([loadCourses(), refreshSelectedCourse(selectedCourse.course.id)]);
    } catch (error: any) {
      Alert.alert("Unable to create", error?.response?.data?.message || "Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const confirmDelete = (assignment: AssignmentRecord) => {
    Alert.alert("Delete assignment", `Delete ${assignment.title}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setDeletingAssignmentId(assignment.id);
            await deleteCourseAssignment(assignment.id);
            if (selectedCourse) {
              if (selectedAssignmentDetail?.assignment.id === assignment.id) {
                setSelectedAssignmentDetail(null);
              }
              await Promise.all([loadCourses(), refreshSelectedCourse(selectedCourse.course.id)]);
            }
          } catch (error: any) {
            Alert.alert("Unable to delete", error?.response?.data?.message || "Please try again.");
          } finally {
            setDeletingAssignmentId(null);
          }
        },
      },
    ]);
  };

  const handleSaveReview = async (assignment: AssignmentRecord, submissionId: string) => {
    if (!selectedCourse) {
      return;
    }

    const rawScore = (draftScores[submissionId] || "").trim();
    const numericScore = rawScore === "" ? 0 : Number(rawScore);

    if (rawScore !== "" && (!Number.isFinite(numericScore) || numericScore < 0 || numericScore > assignment.maxPoints)) {
      Alert.alert("Invalid score", `Enter a number between 0 and ${assignment.maxPoints}.`);
      return;
    }

    try {
      setSavingSubmissionId(submissionId);
      await saveFacultyAssignmentReview(assignment.id, submissionId, {
        score: numericScore,
        feedback: draftFeedback[submissionId] || "",
      });
      await Promise.all([
        refreshSelectedCourse(selectedCourse.course.id),
        refreshSelectedAssignment(selectedCourse.course.id, assignment.id),
      ]);
    } catch (error: any) {
      Alert.alert("Unable to save", error?.response?.data?.message || "Please try again.");
    } finally {
      setSavingSubmissionId(null);
    }
  };

  const openFile = async (submissionId: string, url: string, fileName?: string | null) => {
    try {
      if (Platform.OS === "web") {
        const blob = await downloadAssignmentSubmission(submissionId);
        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = objectUrl;
        anchor.download = fileName || "assignment-submission";
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(objectUrl);
        return;
      }

      const downloadUrl = await getAssignmentSubmissionDownloadUrl(submissionId);
      await Linking.openURL(downloadUrl || url);
    } catch {
      Alert.alert("Unable to open file", "This file could not be downloaded on your device.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-app-bg" edges={["top"]}>
        <LinearGradient colors={["#2563eb", "#7c3aed"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingHorizontal: 20, paddingVertical: 18, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
          <Text className="text-[22px] font-bold text-white">Assignments</Text>
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
        <Text className="text-[22px] font-bold text-white">Assignments</Text>
      </LinearGradient>
      <AnimatedScreen>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-5 pt-4">

        {!selectedCourse ? (
          <>
            <View className="mb-4 rounded-xl bg-app-surface p-4 shadow-card">
              <Text className="mb-2 text-[16px] font-semibold text-app-text">Assigned Courses</Text>
              <Text className="text-app-muted">Select a course to create, review, and manage assignments.</Text>
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
                      <Text className="text-[12px] font-semibold text-app-success">{course.assignmentCount} assignments</Text>
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
                  <Text className="mt-1 text-app-muted">
                    {selectedCourse.course.code} � {selectedCourse.course.credits} credits
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedCourse(null)} className="rounded-full bg-app-primary-bg px-3 py-2">
                  <Text className="font-semibold text-app-primary">Courses</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="mb-4 rounded-xl bg-app-surface p-4 shadow-card">
              <Text className="mb-3 text-[16px] font-semibold text-app-text">Create Assignment</Text>

              <View className="mb-3">
                <Text className="mb-2 text-[12px] font-semibold uppercase tracking-[0.5px] text-app-muted">Title</Text>
                <AppInput
                  value={draftTitle}
                  onChangeText={setDraftTitle}
                  placeholder="Midterm reflection"
                  className="rounded-lg border border-app-border px-4 py-3 text-app-text"
                />
              </View>

              <View className="mb-3">
                <Text className="mb-2 text-[12px] font-semibold uppercase tracking-[0.5px] text-app-muted">Description</Text>
                <AppInput
                  multiline
                  value={draftDescription}
                  onChangeText={setDraftDescription}
                  placeholder="Describe the requirements and expected submission."
                  className="min-h-[96px] rounded-lg border border-app-border px-4 py-3 text-app-text"
                  textAlignVertical="top"
                />
              </View>

              <View className="mb-3">
                <Text className="mb-2 text-[12px] font-semibold uppercase tracking-[0.5px] text-app-muted">Due Date</Text>
                <AppInput
                  value={draftDueDate}
                  onChangeText={setDraftDueDate}
                  placeholder="YYYY-MM-DD"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="rounded-lg border border-app-border px-4 py-3 text-app-text"
                />
              </View>

              <View>
                <Text className="mb-2 text-[12px] font-semibold uppercase tracking-[0.5px] text-app-muted">Max Points</Text>
                <AppInput
                  keyboardType="numeric"
                  value={draftMaxPoints}
                  onChangeText={setDraftMaxPoints}
                  placeholder="100"
                  className="rounded-lg border border-app-border px-4 py-3 text-app-text"
                />
              </View>

              <AppButton
                className="mt-4"
                onPress={handleCreate}
                loading={creating}
              >
                Create Assignment
              </AppButton>
            </View>

            <View className="mb-4 rounded-xl bg-app-surface p-4 shadow-card">
              <Text className="mb-2 text-[16px] font-semibold text-app-text">Published Assignments</Text>
              <Text className="text-app-muted">Track due dates and remove outdated work items when needed.</Text>
            </View>

            {selectedCourse.assignments.length === 0 ? (
              <View className="mb-4 rounded-xl bg-app-surface p-4 shadow-card">
                <Text className="text-app-muted">No assignments posted for this course yet.</Text>
              </View>
            ) : (
              selectedCourse.assignments.map((assignment) => {
                const status = getAssignmentStatus(assignment.dueDate);
                const isSelectedAssignment = selectedAssignmentDetail?.assignment.id === assignment.id;

                return (
                  <View key={assignment.id} className="mb-4 rounded-xl bg-app-surface p-4 shadow-card">
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1">
                        <Text className="text-[16px] font-semibold text-app-text">{assignment.title}</Text>
                        <Text className="mt-1 text-app-muted">
                          Due {formatReadableDate(assignment.dueDate)} � {assignment.maxPoints} points
                        </Text>
                      </View>
                      <View className={`rounded-full px-3 py-2 ${status.chip}`}>
                        <Text className={`text-[12px] font-semibold ${status.tone}`}>{status.label}</Text>
                      </View>
                    </View>

                    {assignment.description ? (
                      <Text className="mt-3 leading-6 text-app-text-secondary">{assignment.description}</Text>
                    ) : (
                      <Text className="mt-3 text-app-placeholder">No description provided.</Text>
                    )}

                    <Text className="mt-3 text-[12px] text-app-placeholder">Created {formatReadableDate(assignment.createdAt)}</Text>

                    <View className="mt-3 flex-row gap-2">
                      <View className="rounded-full bg-app-primary-bg px-3 py-2">
                        <Text className="text-[12px] font-semibold text-app-primary-dark">
                          {assignment.submissionCount || 0} submitted
                        </Text>
                      </View>
                      <View className="rounded-full bg-app-success-bg-subtle px-3 py-2">
                        <Text className="text-[12px] font-semibold text-app-success">
                          {assignment.reviewedCount || 0} reviewed
                        </Text>
                      </View>
                    </View>

                    <AppButton
                      variant="outline"
                      className="mt-4"
                      onPress={() => (isSelectedAssignment ? setSelectedAssignmentDetail(null) : openAssignmentSubmissions(assignment.id))}
                      loading={loadingAssignmentId === assignment.id}
                    >
                      {isSelectedAssignment ? "Hide Submissions" : "View Submissions"}
                    </AppButton>

                    {isSelectedAssignment ? (
                      <View className="mt-4 rounded-lg bg-app-bg-subtle p-4">
                        <Text className="text-[16px] font-semibold text-app-text">Submissions</Text>
                        <Text className="mt-1 text-app-muted">Review student uploads, add scores, and publish feedback.</Text>

                        {selectedAssignmentDetail?.submissions.length ? (
                          selectedAssignmentDetail.submissions.map((submission) => (
                            <View key={submission.id} className="mt-4 rounded-lg border border-app-border-light bg-app-surface p-4">
                              <View className="flex-row items-start justify-between gap-3">
                                <View className="flex-1">
                                  <Text className="text-[15px] font-semibold text-app-text">{submission.student.name}</Text>
                                  <Text className="mt-1 text-app-muted">{submission.student.email}</Text>
                                  <Text className="mt-1 text-app-placeholder">
                                    {submission.student.program || "Program not set"}
                                    {submission.student.yearLevel ? ` � Year ${submission.student.yearLevel}` : ""}
                                  </Text>
                                </View>
                                <View className="rounded-full bg-app-primary-bg px-3 py-2">
                                  <Text className="text-[12px] font-semibold text-app-primary-dark">
                                    Submitted {formatReadableDate(submission.submittedAt)}
                                  </Text>
                                </View>
                              </View>

                              {submission.notes ? (
                                <View className="mt-3 rounded-lg bg-app-bg-subtle p-3">
                                  <Text className="text-[12px] font-semibold uppercase tracking-[0.5px] text-app-muted">Student Notes</Text>
                                  <Text className="mt-2 text-app-text-secondary">{submission.notes}</Text>
                                </View>
                              ) : null}

                              {submission.fileUrl ? (
                                <TouchableOpacity
                                  onPress={() => openFile(submission.id, submission.fileUrl || "", submission.fileName)}
                                  className="mt-3 self-start rounded-full bg-app-primary-bg px-3 py-2"
                                >
                                  <Text className="text-[12px] font-semibold text-app-primary">
                                    {submission.fileName || "Download uploaded file"}
                                  </Text>
                                </TouchableOpacity>
                              ) : (
                                <Text className="mt-3 text-app-placeholder">No file attached.</Text>
                              )}

                              <View className="mt-4">
                                <Text className="mb-2 text-[12px] font-semibold uppercase tracking-[0.5px] text-app-muted">Score</Text>
                                <AppInput
                                  keyboardType="numeric"
                                  value={draftScores[submission.id] || ""}
                                  onChangeText={(value) => setDraftScores((current) => ({ ...current, [submission.id]: value }))}
                                  placeholder={`0 - ${assignment.maxPoints}`}
                                  className="rounded-lg border border-app-border px-4 py-3 text-app-text"
                                />
                              </View>

                              <View className="mt-4">
                                <Text className="mb-2 text-[12px] font-semibold uppercase tracking-[0.5px] text-app-muted">Feedback</Text>
                                <AppInput
                                  multiline
                                  value={draftFeedback[submission.id] || ""}
                                  onChangeText={(value) => setDraftFeedback((current) => ({ ...current, [submission.id]: value }))}
                                  placeholder="Share grading notes or revision guidance."
                                  className="min-h-[84px] rounded-lg border border-app-border px-4 py-3 text-app-text"
                                  textAlignVertical="top"
                                />
                              </View>

                              {submission.reviewedAt ? (
                                <Text className="mt-3 text-[12px] text-app-muted">
                                  Reviewed {formatReadableDate(submission.reviewedAt)}
                                  {submission.score !== null ? ` � Score ${submission.score}/${assignment.maxPoints}` : ""}
                                </Text>
                              ) : (
                                <Text className="mt-3 text-[12px] text-app-placeholder">Not reviewed yet</Text>
                              )}

                              <AppButton
                                className="mt-4"
                                onPress={() => handleSaveReview(assignment, submission.id)}
                                loading={savingSubmissionId === submission.id}
                              >
                                Save Review
                              </AppButton>
                            </View>
                          ))
                        ) : (
                          <View className="mt-4 rounded-lg bg-app-surface p-4">
                            <Text className="text-app-muted">No student submissions yet.</Text>
                          </View>
                        )}
                      </View>
                    ) : null}

                    <AppButton
                      variant="danger"
                      className="mt-4"
                      onPress={() => confirmDelete(assignment)}
                      loading={deletingAssignmentId === assignment.id}
                    >
                      Delete Assignment
                    </AppButton>
                  </View>
                );
              })
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
