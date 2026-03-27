import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
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
    return { label: "Unknown", tone: "text-[#6b7280]", chip: "bg-[#f3f4f6]" };
  }

  if (dueKey < todayKey) {
    return { label: "Overdue", tone: "text-[#b91c1c]", chip: "bg-[#fee2e2]" };
  }

  if (dueKey === todayKey) {
    return { label: "Due Today", tone: "text-[#b45309]", chip: "bg-[#fef3c7]" };
  }

  return { label: "Upcoming", tone: "text-[#047857]", chip: "bg-[#d1fae5]" };
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
    const numericScore = rawScore === "" ? null : Number(rawScore);

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
      <SafeAreaView className="flex-1 items-center justify-center bg-[#f5f7fb]" edges={["top"]}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-3 text-[#6b7280]">Loading assignments...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f5f7fb]" edges={["top"]}>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-5">
        <Text className="mb-4 text-[22px] font-bold text-[#111827]">Assignments</Text>

        {!selectedCourse ? (
          <>
            <View className="mb-4 rounded-xl bg-white p-4 shadow">
              <Text className="mb-2 text-[16px] font-semibold text-[#111827]">Assigned Courses</Text>
              <Text className="text-[#6b7280]">Select a course to create, review, and manage assignments.</Text>
            </View>

            {courses.length === 0 ? (
              <View className="mb-4 rounded-xl bg-white p-4 shadow">
                <Text className="text-[#6b7280]">No courses assigned yet.</Text>
              </View>
            ) : (
              courses.map((course) => (
                <TouchableOpacity
                  key={course.id}
                  className="mb-4 rounded-xl bg-white p-4 shadow"
                  onPress={() => openCourse(course.id)}
                  disabled={loadingCourseId === course.id}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 pr-3">
                      <Text className="text-[16px] font-semibold text-[#111827]">{course.title}</Text>
                      <Text className="mt-1 text-[#6b7280]">{course.code} • {course.credits} credits</Text>
                    </View>
                    <Text className="text-[12px] font-semibold text-[#2563eb]">
                      {loadingCourseId === course.id ? "Loading..." : "Open"}
                    </Text>
                  </View>

                  <View className="mt-3 flex-row gap-2">
                    <View className="rounded-full bg-[#eff6ff] px-3 py-2">
                      <Text className="text-[12px] font-semibold text-[#1d4ed8]">{course.enrolledCount} enrolled</Text>
                    </View>
                    <View className="rounded-full bg-[#ecfdf5] px-3 py-2">
                      <Text className="text-[12px] font-semibold text-[#047857]">{course.assignmentCount} assignments</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        ) : (
          <>
            <View className="mb-4 rounded-xl bg-white p-4 shadow">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-[18px] font-semibold text-[#111827]">{selectedCourse.course.title}</Text>
                  <Text className="mt-1 text-[#6b7280]">
                    {selectedCourse.course.code} • {selectedCourse.course.credits} credits
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedCourse(null)} className="rounded-full bg-[#eff6ff] px-3 py-2">
                  <Text className="font-semibold text-[#2563eb]">Courses</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="mb-4 rounded-xl bg-white p-4 shadow">
              <Text className="mb-3 text-[16px] font-semibold text-[#111827]">Create Assignment</Text>

              <View className="mb-3">
                <Text className="mb-2 text-[12px] font-semibold uppercase tracking-[0.5px] text-[#6b7280]">Title</Text>
                <TextInput
                  value={draftTitle}
                  onChangeText={setDraftTitle}
                  placeholder="Midterm reflection"
                  className="rounded-lg border border-[#d1d5db] px-4 py-3 text-[#111827]"
                />
              </View>

              <View className="mb-3">
                <Text className="mb-2 text-[12px] font-semibold uppercase tracking-[0.5px] text-[#6b7280]">Description</Text>
                <TextInput
                  multiline
                  value={draftDescription}
                  onChangeText={setDraftDescription}
                  placeholder="Describe the requirements and expected submission."
                  className="min-h-[96px] rounded-lg border border-[#d1d5db] px-4 py-3 text-[#111827]"
                  textAlignVertical="top"
                />
              </View>

              <View className="mb-3">
                <Text className="mb-2 text-[12px] font-semibold uppercase tracking-[0.5px] text-[#6b7280]">Due Date</Text>
                <TextInput
                  value={draftDueDate}
                  onChangeText={setDraftDueDate}
                  placeholder="YYYY-MM-DD"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="rounded-lg border border-[#d1d5db] px-4 py-3 text-[#111827]"
                />
              </View>

              <View>
                <Text className="mb-2 text-[12px] font-semibold uppercase tracking-[0.5px] text-[#6b7280]">Max Points</Text>
                <TextInput
                  keyboardType="numeric"
                  value={draftMaxPoints}
                  onChangeText={setDraftMaxPoints}
                  placeholder="100"
                  className="rounded-lg border border-[#d1d5db] px-4 py-3 text-[#111827]"
                />
              </View>

              <TouchableOpacity
                className="mt-4 items-center rounded-lg bg-blue-500 p-[14px]"
                onPress={handleCreate}
                disabled={creating}
              >
                <Text className="font-semibold text-white">{creating ? "Creating..." : "Create Assignment"}</Text>
              </TouchableOpacity>
            </View>

            <View className="mb-4 rounded-xl bg-white p-4 shadow">
              <Text className="mb-2 text-[16px] font-semibold text-[#111827]">Published Assignments</Text>
              <Text className="text-[#6b7280]">Track due dates and remove outdated work items when needed.</Text>
            </View>

            {selectedCourse.assignments.length === 0 ? (
              <View className="mb-4 rounded-xl bg-white p-4 shadow">
                <Text className="text-[#6b7280]">No assignments posted for this course yet.</Text>
              </View>
            ) : (
              selectedCourse.assignments.map((assignment) => {
                const status = getAssignmentStatus(assignment.dueDate);
                const isSelectedAssignment = selectedAssignmentDetail?.assignment.id === assignment.id;

                return (
                  <View key={assignment.id} className="mb-4 rounded-xl bg-white p-4 shadow">
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1">
                        <Text className="text-[16px] font-semibold text-[#111827]">{assignment.title}</Text>
                        <Text className="mt-1 text-[#6b7280]">
                          Due {formatReadableDate(assignment.dueDate)} • {assignment.maxPoints} points
                        </Text>
                      </View>
                      <View className={`rounded-full px-3 py-2 ${status.chip}`}>
                        <Text className={`text-[12px] font-semibold ${status.tone}`}>{status.label}</Text>
                      </View>
                    </View>

                    {assignment.description ? (
                      <Text className="mt-3 leading-6 text-[#374151]">{assignment.description}</Text>
                    ) : (
                      <Text className="mt-3 text-[#9ca3af]">No description provided.</Text>
                    )}

                    <Text className="mt-3 text-[12px] text-[#9ca3af]">Created {formatReadableDate(assignment.createdAt)}</Text>

                    <View className="mt-3 flex-row gap-2">
                      <View className="rounded-full bg-[#eff6ff] px-3 py-2">
                        <Text className="text-[12px] font-semibold text-[#1d4ed8]">
                          {assignment.submissionCount || 0} submitted
                        </Text>
                      </View>
                      <View className="rounded-full bg-[#ecfdf5] px-3 py-2">
                        <Text className="text-[12px] font-semibold text-[#047857]">
                          {assignment.reviewedCount || 0} reviewed
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      className="mt-4 items-center rounded-lg bg-[#e5e7eb] p-[14px]"
                      onPress={() => (isSelectedAssignment ? setSelectedAssignmentDetail(null) : openAssignmentSubmissions(assignment.id))}
                      disabled={loadingAssignmentId === assignment.id}
                    >
                      <Text className="font-semibold text-[#374151]">
                        {loadingAssignmentId === assignment.id
                          ? "Loading..."
                          : isSelectedAssignment
                            ? "Hide Submissions"
                            : "View Submissions"}
                      </Text>
                    </TouchableOpacity>

                    {isSelectedAssignment ? (
                      <View className="mt-4 rounded-lg bg-[#f9fafb] p-4">
                        <Text className="text-[16px] font-semibold text-[#111827]">Submissions</Text>
                        <Text className="mt-1 text-[#6b7280]">Review student uploads, add scores, and publish feedback.</Text>

                        {selectedAssignmentDetail?.submissions.length ? (
                          selectedAssignmentDetail.submissions.map((submission) => (
                            <View key={submission.id} className="mt-4 rounded-lg border border-[#e5e7eb] bg-white p-4">
                              <View className="flex-row items-start justify-between gap-3">
                                <View className="flex-1">
                                  <Text className="text-[15px] font-semibold text-[#111827]">{submission.student.name}</Text>
                                  <Text className="mt-1 text-[#6b7280]">{submission.student.email}</Text>
                                  <Text className="mt-1 text-[#9ca3af]">
                                    {submission.student.program || "Program not set"}
                                    {submission.student.yearLevel ? ` • Year ${submission.student.yearLevel}` : ""}
                                  </Text>
                                </View>
                                <View className="rounded-full bg-[#eff6ff] px-3 py-2">
                                  <Text className="text-[12px] font-semibold text-[#1d4ed8]">
                                    Submitted {formatReadableDate(submission.submittedAt)}
                                  </Text>
                                </View>
                              </View>

                              {submission.notes ? (
                                <View className="mt-3 rounded-lg bg-[#f9fafb] p-3">
                                  <Text className="text-[12px] font-semibold uppercase tracking-[0.5px] text-[#6b7280]">Student Notes</Text>
                                  <Text className="mt-2 text-[#374151]">{submission.notes}</Text>
                                </View>
                              ) : null}

                              {submission.fileUrl ? (
                                <TouchableOpacity
                                  onPress={() => openFile(submission.id, submission.fileUrl || "", submission.fileName)}
                                  className="mt-3 self-start rounded-full bg-[#eff6ff] px-3 py-2"
                                >
                                  <Text className="text-[12px] font-semibold text-[#2563eb]">
                                    {submission.fileName || "Download uploaded file"}
                                  </Text>
                                </TouchableOpacity>
                              ) : (
                                <Text className="mt-3 text-[#9ca3af]">No file attached.</Text>
                              )}

                              <View className="mt-4">
                                <Text className="mb-2 text-[12px] font-semibold uppercase tracking-[0.5px] text-[#6b7280]">Score</Text>
                                <TextInput
                                  keyboardType="numeric"
                                  value={draftScores[submission.id] || ""}
                                  onChangeText={(value) => setDraftScores((current) => ({ ...current, [submission.id]: value }))}
                                  placeholder={`0 - ${assignment.maxPoints}`}
                                  className="rounded-lg border border-[#d1d5db] px-4 py-3 text-[#111827]"
                                />
                              </View>

                              <View className="mt-4">
                                <Text className="mb-2 text-[12px] font-semibold uppercase tracking-[0.5px] text-[#6b7280]">Feedback</Text>
                                <TextInput
                                  multiline
                                  value={draftFeedback[submission.id] || ""}
                                  onChangeText={(value) => setDraftFeedback((current) => ({ ...current, [submission.id]: value }))}
                                  placeholder="Share grading notes or revision guidance."
                                  className="min-h-[84px] rounded-lg border border-[#d1d5db] px-4 py-3 text-[#111827]"
                                  textAlignVertical="top"
                                />
                              </View>

                              {submission.reviewedAt ? (
                                <Text className="mt-3 text-[12px] text-[#6b7280]">
                                  Reviewed {formatReadableDate(submission.reviewedAt)}
                                  {submission.score !== null ? ` • Score ${submission.score}/${assignment.maxPoints}` : ""}
                                </Text>
                              ) : (
                                <Text className="mt-3 text-[12px] text-[#9ca3af]">Not reviewed yet</Text>
                              )}

                              <TouchableOpacity
                                className="mt-4 items-center rounded-lg bg-blue-500 p-[14px]"
                                onPress={() => handleSaveReview(assignment, submission.id)}
                                disabled={savingSubmissionId === submission.id}
                              >
                                <Text className="font-semibold text-white">
                                  {savingSubmissionId === submission.id ? "Saving..." : "Save Review"}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          ))
                        ) : (
                          <View className="mt-4 rounded-lg bg-white p-4">
                            <Text className="text-[#6b7280]">No student submissions yet.</Text>
                          </View>
                        )}
                      </View>
                    ) : null}

                    <TouchableOpacity
                      className="mt-4 items-center rounded-lg bg-[#ef4444] p-[14px]"
                      onPress={() => confirmDelete(assignment)}
                      disabled={deletingAssignmentId === assignment.id}
                    >
                      <Text className="font-semibold text-white">
                        {deletingAssignmentId === assignment.id ? "Deleting..." : "Delete Assignment"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </>
        )}

        <TouchableOpacity
          className="items-center rounded-lg bg-blue-500 p-[14px]"
          onPress={() => router.push("/faculty/dashboard")}
        >
          <Text className="font-semibold text-white">Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
