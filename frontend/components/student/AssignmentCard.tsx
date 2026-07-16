import { useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { AppButton, AppInput } from "../ui";
import { MAX_SUBMISSION_BYTES } from "../../constants/api";
// Imported statically on purpose: a dynamic `await import()` inside the press
// handler consumes the browser's user-gesture context on the first click, so the
// web file input's .click() gets blocked and picking only works on the 2nd try.
import * as DocumentPicker from "expo-document-picker";
import {
  submitStudentAssignment,
  type AssignmentRecord,
} from "../../services/facultyServices/assignmentService";

type DocumentPickerAsset = DocumentPicker.DocumentPickerAsset;

// ── helpers ──────────────────────────────────────────────────────────────────

const MAX_SUBMISSION_MB = Math.round(MAX_SUBMISSION_BYTES / (1024 * 1024));

const toDateKey = (date = new Date()) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatReadableDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const getAssignmentStatus = (dueDate: string) => {
  const due = new Date(dueDate);
  const dueKey = toDateKey(due);
  const todayKey = toDateKey(new Date());
  if (Number.isNaN(due.getTime()))
    return { label: "Unknown", chip: "bg-app-bg-muted", text: "text-app-muted" };
  if (dueKey < todayKey) return { label: "Overdue", chip: "bg-app-error-bg", text: "text-app-error" };
  if (dueKey === todayKey)
    return { label: "Due Today", chip: "bg-app-warning-bg", text: "text-app-warning" };
  return { label: "Upcoming", chip: "bg-app-success-bg", text: "text-app-success" };
};

const inferMimeTypeFromName = (fileName: string) => {
  const n = fileName.toLowerCase();
  if (n.endsWith(".pdf")) return "application/pdf";
  if (n.endsWith(".doc")) return "application/msword";
  if (n.endsWith(".docx"))
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (n.endsWith(".txt")) return "text/plain";
  if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "image/jpeg";
  if (n.endsWith(".png")) return "image/png";
  if (n.endsWith(".webp")) return "image/webp";
  if (n.endsWith(".gif")) return "image/gif";
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
      formData.append("submissionFile", new File([blob], selectedFile.name, { type: resolvedType }), selectedFile.name);
      return;
    }
  }

  formData.append("submissionFile", {
    uri: selectedFile.uri,
    name: selectedFile.name,
    type: resolvedType,
  } as any);
};

// ── component ─────────────────────────────────────────────────────────────────

type Props = {
  assignment: AssignmentRecord;
  onSubmitSuccess: () => void;
  onOpenFile: (submissionId: string, url: string, fileName?: string | null) => void;
};

export default function AssignmentCard({ assignment, onSubmitSuccess, onOpenFile }: Props) {
  const [notes, setNotes] = useState(assignment.submission?.notes || "");
  const [selectedFile, setSelectedFile] = useState<DocumentPickerAsset | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const status = getAssignmentStatus(assignment.dueDate);

  const pickDocument = async () => {
    try {
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
      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      if (typeof asset.size === "number" && asset.size > MAX_SUBMISSION_BYTES) {
        Toast.show({
          type: "error",
          text1: "File too large",
          text2: `Choose a file under ${MAX_SUBMISSION_MB} MB.`,
        });
        return;
      }

      setSelectedFile(asset);
    } catch {
      Toast.show({ type: "error", text1: "Unable to pick file", text2: "Please try again." });
    }
  };

  const handleSubmit = async () => {
    const trimmedNotes = notes.trim();
    if (!trimmedNotes && !selectedFile) {
      Toast.show({
        type: "error",
        text1: "Nothing to submit",
        text2: "Add notes or choose a file before submitting.",
      });
      return;
    }

    const isResubmit = Boolean(assignment.submission);

    try {
      setSubmitting(true);
      const formData = new FormData();
      if (trimmedNotes) formData.append("notes", trimmedNotes);
      if (selectedFile) await appendSubmissionFile(formData, selectedFile);

      await submitStudentAssignment(assignment.id, formData);
      setSelectedFile(null);
      Toast.show({
        type: "success",
        text1: isResubmit ? "Assignment resubmitted" : "Assignment submitted",
      });
      onSubmitSuccess();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Unable to submit",
        text2: error?.response?.data?.message || "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="mt-4 rounded-lg border border-app-border-light p-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-app-base font-semibold text-app-text">{assignment.title}</Text>
          <Text className="mt-1 text-app-muted">
            Due {formatReadableDate(assignment.dueDate)} · {assignment.maxPoints} points
          </Text>
        </View>
        <View className={`rounded-full px-3 py-2 ${status.chip}`}>
          <Text className={`text-app-xs font-semibold ${status.text}`}>{status.label}</Text>
        </View>
      </View>

      {assignment.description ? (
        <Text className="mt-3 leading-6 text-app-text-secondary">{assignment.description}</Text>
      ) : (
        <Text className="mt-3 text-app-placeholder">No description provided.</Text>
      )}

      {assignment.submission ? (
        <View className="mt-4 rounded-lg bg-app-bg-subtle p-3">
          <Text className="text-app-xs font-semibold uppercase tracking-[0.5px] text-app-muted">
            Current Submission
          </Text>
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
              <Text className="text-app-xs font-semibold uppercase tracking-[0.5px] text-app-muted">
                Faculty Feedback
              </Text>
              <Text className="mt-2 text-app-text-secondary">{assignment.submission.feedback}</Text>
            </View>
          ) : null}
          {assignment.submission.fileUrl ? (
            <TouchableOpacity
              onPress={() =>
                onOpenFile(
                  assignment.submission?.id || "",
                  assignment.submission?.fileUrl || "",
                  assignment.submission?.fileName
                )
              }
              className="mt-3 self-start rounded-full bg-app-primary-bg px-3 py-2"
            >
              <Text className="text-app-xs font-semibold text-app-primary">
                {assignment.submission.fileName || "Download uploaded file"}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      <View className="mt-4">
        <Text className="mb-2 text-app-xs font-semibold uppercase tracking-[0.5px] text-app-muted">
          Submission Notes
        </Text>
        <AppInput
          multiline
          value={notes}
          onChangeText={setNotes}
          placeholder="Add notes, links, or short submission details."
          style={{ minHeight: 84 }}
          textAlignVertical="top"
        />
      </View>

      <View className="mt-4 rounded-lg bg-app-bg-subtle p-3">
        <Text className="text-app-xs font-semibold uppercase tracking-[0.5px] text-app-muted">File Upload</Text>
        <Text className="mt-2 text-app-muted">
          {selectedFile
            ? `${selectedFile.name}${selectedFile.size ? ` · ${Math.ceil(selectedFile.size / 1024)} KB` : ""}`
            : `Choose a PDF, DOC, DOCX, TXT, JPG, PNG, WEBP, or GIF file up to ${MAX_SUBMISSION_MB} MB.`}
        </Text>
        <View className="mt-3 flex-row gap-2">
          <TouchableOpacity
            className="flex-1 items-center rounded-lg bg-app-border-light p-[12px]"
            onPress={pickDocument}
          >
            <Text className="font-semibold text-app-text-secondary">
              {selectedFile ? "Change File" : "Choose File"}
            </Text>
          </TouchableOpacity>
          {selectedFile ? (
            <TouchableOpacity
              className="items-center rounded-lg bg-app-error-bg-subtle px-4 py-[12px]"
              onPress={() => setSelectedFile(null)}
            >
              <Text className="font-semibold text-app-error">Clear</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <AppButton
        title={submitting ? "Submitting..." : assignment.submission ? "Resubmit Assignment" : "Submit Assignment"}
        loading={submitting}
        onPress={handleSubmit}
        className="mt-4 items-center rounded-lg bg-app-primary p-[14px]"
        textClassName="font-semibold text-white"
      />
    </View>
  );
}
