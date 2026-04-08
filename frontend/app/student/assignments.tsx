import { useEffect, useState } from "react";
import { Alert, Linking, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import AnimatedScreen from "../../components/AnimatedScreen";
import { SkeletonStatRow, SkeletonList } from "../../components/Skeleton";
import type { DocumentPickerAsset } from "expo-document-picker";
import {
  downloadAssignmentSubmission,
  getAssignmentSubmissionDownloadUrl,
  getStudentAssignments,
  submitStudentAssignment,
  type AssignmentRecord,
  type StudentAssignmentsResponse,
} from "../../services/facultyServices/assignmentService";

const toDateKey = (date = new Date()) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

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
  const dueKey = toDateKey(due);
  const todayKey = toDateKey(new Date());

  if (Number.isNaN(due.getTime())) {
    return { label: "Unknown", chip: "bg-app-bg-muted", text: "text-app-muted" };
  }

  if (dueKey < todayKey) {
    return { label: "Overdue", chip: "bg-app-error-bg", text: "text-app-error" };
  }

  if (dueKey === todayKey) {
    return { label: "Due Today", chip: "bg-app-warning-bg", text: "text-app-warning" };
  }

  return { label: "Upcoming", chip: "bg-app-success-bg", text: "text-app-success" };
};

const inferMimeTypeFromName = (fileName: string) => {
  const normalized = fileName.toLowerCase();

  if (normalized.endsWith(".pdf")) return "application/pdf";
  if (normalized.endsWith(".doc")) return "application/msword";
  if (normalized.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (normalized.endsWith(".txt")) return "text/plain";
  if (normalized.endsWith(".jpg") || normalized.endsWith(".jpeg")) return "image/jpeg";
  if (normalized.endsWith(".png")) return "image/png";
  if (normalized.endsWith(".webp")) return "image/webp";
  if (normalized.endsWith(".gif")) return "image/gif";

  return "application/octet-stream";
};

const appendSubmissionFile = async (formData: FormData, selectedFile: DocumentPickerAsset) => {
  const resolvedType = selectedFile.mimeType || inferMimeTypeFromName(selectedFile.name);

  if (Platform.OS === "web") {
    const browserFile = (selectedFile as DocumentPickerAsset & { file?: File }).file;

    if (browserFile) {
      const normalizedFile =
        browserFile.type === resolvedType && browserFile.name === selectedFile.name
          ? browserFile
          : new File([browserFile], selectedFile.name, { type: resolvedType });

      formData.append("submissionFile", normalizedFile, selectedFile.name);
      return;
    }

    if (selectedFile.uri) {
      const response = await fetch(selectedFile.uri);
      const blob = await response.blob();
      const normalizedFile = new File([blob], selectedFile.name, { type: resolvedType });
      formData.append("submissionFile", normalizedFile, selectedFile.name);
      return;
    }
  }

  formData.append("submissionFile", {
    uri: selectedFile.uri,
    name: selectedFile.name,
    type: resolvedType,
  } as any);
};

export default function StudentAssignments() {
  const router = useRouter();
  const [data, setData] = useState<StudentAssignmentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<string, DocumentPickerAsset | null>>({});
  const [submittingAssignmentId, setSubmittingAssignmentId] = useState<string | null>(null);

  const hydrateDraftNotes = (response: StudentAssignmentsResponse) => {
    setDraftNotes(
      Object.fromEntries(
        response.items.flatMap((item) =>
          item.assignments.map((assignment) => [assignment.id, assignment.submission?.notes || ""])
        )
      )
    );
  };

  const loadAssignments = async () => {
    const response = await getStudentAssignments();
    setData(response);
    hydrateDraftNotes(response);
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const response = await getStudentAssignments();
        setData(response);
        hydrateDraftNotes(response);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const pickDocument = async (assignmentId: string) => {
    try {
      const DocumentPicker = await import("expo-document-picker");
      const result = await DocumentPicker.getDocumentAsync({
        multiple: false,
        copyToCacheDirectory: true,
        base64: false,
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "image/*",
          "text/plain",
        ],
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      setSelectedFiles((current) => ({ ...current, [assignmentId]: result.assets[0] }));
    } catch {
      Alert.alert("Unable to pick file", "Please try again.");
    }
  };

  const handleSubmit = async (assignment: AssignmentRecord) => {
    const notes = (draftNotes[assignment.id] || "").trim();
    const selectedFile = selectedFiles[assignment.id];

    if (!notes && !selectedFile) {
      Alert.alert("Nothing to submit", "Add notes or choose a file before submitting.");
      return;
    }

    try {
      setSubmittingAssignmentId(assignment.id);
      const formData = new FormData();

      if (notes) {
        formData.append("notes", notes);
      }

      if (selectedFile) {
        await appendSubmissionFile(formData, selectedFile);
      }

      await submitStudentAssignment(assignment.id, formData);
      setSelectedFiles((current) => ({ ...current, [assignment.id]: null }));
      await loadAssignments();
    } catch (error: any) {
      Alert.alert("Unable to submit", error?.response?.data?.message || "Please try again.");
    } finally {
      setSubmittingAssignmentId(null);
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
          <SkeletonStatRow count={3} />
          <SkeletonStatRow count={2} />
          <SkeletonList rows={3} />
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

        <View className="mb-4 flex-row justify-between gap-2">
          <View className="flex-1 rounded-xl bg-app-surface p-4 shadow-card">
            <Text className="text-[20px] font-bold text-app-text">{data?.summary.courseCount || 0}</Text>
            <Text className="mt-1 text-[12px] text-app-muted">Courses</Text>
          </View>
          <View className="flex-1 rounded-xl bg-app-surface p-4 shadow-card">
            <Text className="text-[20px] font-bold text-app-text">{data?.summary.assignmentCount || 0}</Text>
            <Text className="mt-1 text-[12px] text-app-muted">Assignments</Text>
          </View>
          <View className="flex-1 rounded-xl bg-app-surface p-4 shadow-card">
            <Text className="text-[20px] font-bold text-app-text">{data?.summary.dueTodayCount || 0}</Text>
            <Text className="mt-1 text-[12px] text-app-muted">Due Today</Text>
          </View>
        </View>

        <View className="mb-4 flex-row justify-between gap-2">
          <View className="flex-1 rounded-xl bg-app-surface p-4 shadow-card">
            <Text className="text-[20px] font-bold text-app-text">{data?.summary.upcomingCount || 0}</Text>
            <Text className="mt-1 text-[12px] text-app-muted">Upcoming</Text>
          </View>
          <View className="flex-1 rounded-xl bg-app-surface p-4 shadow-card">
            <Text className="text-[20px] font-bold text-app-text">{data?.summary.submittedCount || 0}</Text>
            <Text className="mt-1 text-[12px] text-app-muted">Submitted</Text>
          </View>
        </View>

        <View className="mb-4 flex-row justify-between gap-2">
          <View className="flex-1 rounded-xl bg-app-surface p-4 shadow-card">
            <Text className="text-[20px] font-bold text-app-text">{data?.summary.pendingCount || 0}</Text>
            <Text className="mt-1 text-[12px] text-app-muted">Pending</Text>
          </View>
          <View className="flex-1 rounded-xl bg-app-surface p-4 shadow-card">
            <Text className="text-[20px] font-bold text-app-text">{data?.summary.overdueCount || 0}</Text>
            <Text className="mt-1 text-[12px] text-app-muted">Overdue</Text>
          </View>
        </View>

        {!data?.items.length ? (
          <View className="mb-4 rounded-xl bg-app-surface p-4 shadow-card">
            <Text className="mb-2 text-[16px] font-semibold text-app-text">No Assignments Yet</Text>
            <Text className="text-app-muted">Assignments from your enrolled courses will appear here once faculty publish them.</Text>
          </View>
        ) : (
          data.items.map((item) => (
            <View key={item.course.id} className="mb-4 rounded-xl bg-app-surface p-4 shadow-card">
              <Text className="text-[16px] font-semibold text-app-text">{item.course.title}</Text>
              <Text className="mt-1 text-app-muted">{item.course.code} � {item.course.credits} credits</Text>
              <Text className="mt-1 text-app-placeholder">Faculty: {item.course.facultyName}</Text>

              {item.assignments.length === 0 ? (
                <View className="mt-4 rounded-lg bg-app-bg-subtle p-3">
                  <Text className="text-app-muted">No assignments published for this course yet.</Text>
                </View>
              ) : (
                item.assignments.map((assignment) => {
                  const status = getAssignmentStatus(assignment.dueDate);
                  const chosenFile = selectedFiles[assignment.id];
                  const currentNotes = draftNotes[assignment.id] ?? assignment.submission?.notes ?? "";

                  return (
                    <View key={assignment.id} className="mt-4 rounded-lg border border-app-border-light p-4">
                      <View className="flex-row items-start justify-between gap-3">
                        <View className="flex-1">
                          <Text className="text-[15px] font-semibold text-app-text">{assignment.title}</Text>
                          <Text className="mt-1 text-app-muted">
                            Due {formatReadableDate(assignment.dueDate)} � {assignment.maxPoints} points
                          </Text>
                        </View>
                        <View className={`rounded-full px-3 py-2 ${status.chip}`}>
                          <Text className={`text-[12px] font-semibold ${status.text}`}>{status.label}</Text>
                        </View>
                      </View>

                      {assignment.description ? (
                        <Text className="mt-3 leading-6 text-app-text-secondary">{assignment.description}</Text>
                      ) : (
                        <Text className="mt-3 text-app-placeholder">No description provided.</Text>
                      )}

                      {assignment.submission ? (
                        <View className="mt-4 rounded-lg bg-app-bg-subtle p-3">
                          <Text className="text-[12px] font-semibold uppercase tracking-[0.5px] text-app-muted">Current Submission</Text>
                          <Text className="mt-2 text-app-text-secondary">
                            Submitted {formatReadableDate(assignment.submission.submittedAt)}
                          </Text>
                          {assignment.submission.score !== null ? (
                            <Text className="mt-2 font-semibold text-app-text">
                              Score: {assignment.submission.score}/{assignment.maxPoints}
                            </Text>
                          ) : null}
                          {assignment.submission.notes ? (
                            <Text className="mt-2 text-app-muted">{assignment.submission.notes}</Text>
                          ) : null}
                          {assignment.submission.feedback ? (
                            <View className="mt-3 rounded-lg bg-app-surface p-3">
                              <Text className="text-[12px] font-semibold uppercase tracking-[0.5px] text-app-muted">Faculty Feedback</Text>
                              <Text className="mt-2 text-app-text-secondary">{assignment.submission.feedback}</Text>
                            </View>
                          ) : null}
                          {assignment.submission.fileUrl ? (
                            <TouchableOpacity onPress={() => openFile(assignment.submission?.id || "", assignment.submission?.fileUrl || "", assignment.submission?.fileName)} className="mt-3 self-start rounded-full bg-app-primary-bg px-3 py-2">
                              <Text className="text-[12px] font-semibold text-app-primary">
                                {assignment.submission.fileName || "Download uploaded file"}
                              </Text>
                            </TouchableOpacity>
                          ) : null}
                        </View>
                      ) : null}

                      <View className="mt-4">
                        <Text className="mb-2 text-[12px] font-semibold uppercase tracking-[0.5px] text-app-muted">Submission Notes</Text>
                        <TextInput
                          multiline
                          value={currentNotes}
                          onChangeText={(value) => setDraftNotes((current) => ({ ...current, [assignment.id]: value }))}
                          placeholder="Add notes, links, or short submission details."
                          className="min-h-[84px] rounded-lg border border-app-border px-4 py-3 text-app-text"
                          textAlignVertical="top"
                        />
                      </View>

                      <View className="mt-4 rounded-lg bg-app-bg-subtle p-3">
                        <Text className="text-[12px] font-semibold uppercase tracking-[0.5px] text-app-muted">File Upload</Text>
                        <Text className="mt-2 text-app-muted">
                          {chosenFile
                            ? `${chosenFile.name}${chosenFile.size ? ` � ${Math.ceil(chosenFile.size / 1024)} KB` : ""}`
                            : "Choose a PDF, DOC, DOCX, TXT, JPG, PNG, WEBP, or GIF file up to 10 MB."}
                        </Text>

                        <View className="mt-3 flex-row gap-2">
                          <TouchableOpacity className="flex-1 items-center rounded-lg bg-app-border-light p-[12px]" onPress={() => pickDocument(assignment.id)}>
                            <Text className="font-semibold text-app-text-secondary">{chosenFile ? "Change File" : "Choose File"}</Text>
                          </TouchableOpacity>
                          {chosenFile ? (
                            <TouchableOpacity
                              className="items-center rounded-lg bg-app-error-bg-subtle px-4 py-[12px]"
                              onPress={() => setSelectedFiles((current) => ({ ...current, [assignment.id]: null }))}
                            >
                              <Text className="font-semibold text-app-error">Clear</Text>
                            </TouchableOpacity>
                          ) : null}
                        </View>
                      </View>

                      <TouchableOpacity
                        className="mt-4 items-center rounded-lg bg-blue-500 p-[14px]"
                        onPress={() => handleSubmit(assignment)}
                        disabled={submittingAssignmentId === assignment.id}
                      >
                        <Text className="font-semibold text-white">
                          {submittingAssignmentId === assignment.id
                            ? "Submitting..."
                            : assignment.submission
                              ? "Resubmit Assignment"
                              : "Submit Assignment"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </View>
          ))
        )}

        <TouchableOpacity
          className="items-center rounded-lg bg-blue-500 p-[14px]"
          onPress={() => router.push("/student/dashboard")}
        >
          <Text className="font-semibold text-white">Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
      </AnimatedScreen>
    </SafeAreaView>
  );
}
