import { Alert, Linking, Platform, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ScreenLayout from "../../components/ScreenLayout";
import { SkeletonStatRow, SkeletonList } from "../../components/Skeleton";
import { AppButton } from "../../components/ui";
import {
  downloadAssignmentSubmission,
  getAssignmentSubmissionDownloadUrl,
  getStudentAssignments,
} from "../../services/facultyServices/assignmentService";
import StatsCards from "../../components/student/StatsCards";
import AssignmentCard from "../../components/student/AssignmentCard";

export default function StudentAssignments() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["student-assignments"],
    queryFn: getStudentAssignments,
  });

  const invalidateAssignments = () =>
    queryClient.invalidateQueries({ queryKey: ["student-assignments"] });

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

  if (isLoading) {
    return (
      <ScreenLayout title="Assignments" backRoute="/student/dashboard">
        <SkeletonStatRow count={3} />
        <SkeletonStatRow count={2} />
        <SkeletonList rows={3} />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title="Assignments" backRoute="/student/dashboard">
          {data?.summary && <StatsCards summary={data.summary} />}

          {!data?.items.length ? (
            <View className="mb-4 rounded-xl bg-app-surface p-4 shadow-card">
              <Text className="mb-2 text-[16px] font-semibold text-app-text">No Assignments Yet</Text>
              <Text className="text-app-muted">
                Assignments from your enrolled courses will appear here once faculty publish them.
              </Text>
            </View>
          ) : (
            data.items.map((item) => (
              <View key={item.course.id} className="mb-4 rounded-xl bg-app-surface p-4 shadow-card">
                <Text className="text-[16px] font-semibold text-app-text">{item.course.title}</Text>
                <Text className="mt-1 text-app-muted">
                  {item.course.code} · {item.course.credits} credits
                </Text>
                <Text className="mt-1 text-app-placeholder">Faculty: {item.course.facultyName}</Text>

                {item.assignments.length === 0 ? (
                  <View className="mt-4 rounded-lg bg-app-bg-subtle p-3">
                    <Text className="text-app-muted">No assignments published for this course yet.</Text>
                  </View>
                ) : (
                  item.assignments.map((assignment) => (
                    <AssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      onSubmitSuccess={invalidateAssignments}
                      onOpenFile={openFile}
                    />
                  ))
                )}
              </View>
            ))
          )}

          <AppButton onPress={() => router.push("/student/dashboard")}>
            Back to Dashboard
          </AppButton>
    </ScreenLayout>
  );
}
