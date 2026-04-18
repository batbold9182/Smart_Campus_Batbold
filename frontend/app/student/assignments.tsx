import { useEffect, useState } from "react";
import { Alert, Linking, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import AnimatedScreen from "../../components/AnimatedScreen";
import { SkeletonStatRow, SkeletonList } from "../../components/Skeleton";
import { AppButton } from "../../components/ui";
import {
  downloadAssignmentSubmission,
  getAssignmentSubmissionDownloadUrl,
  getStudentAssignments,
  type StudentAssignmentsResponse,
} from "../../services/facultyServices/assignmentService";
import StatsCards from "../../components/student/StatsCards";
import AssignmentCard from "../../components/student/AssignmentCard";

export default function StudentAssignments() {
  const router = useRouter();
  const [data, setData] = useState<StudentAssignmentsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAssignments = async () => {
    const response = await getStudentAssignments();
    setData(response);
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const response = await getStudentAssignments();
        setData(response);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

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
        <LinearGradient
          colors={["#2563eb", "#7c3aed"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ paddingHorizontal: 20, paddingVertical: 18, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
        >
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
      <LinearGradient
        colors={["#2563eb", "#7c3aed"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ paddingHorizontal: 20, paddingVertical: 18, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
      >
        <Text className="text-[22px] font-bold text-white">Assignments</Text>
      </LinearGradient>

      <AnimatedScreen>
        <ScrollView className="flex-1 px-5" contentContainerClassName="pb-5 pt-4">
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
                        onSubmitSuccess={loadAssignments}
                        onOpenFile={openFile}
                      />
                    ))
                  )}
                </View>
              ))
            )}

            <AppButton
              title="Back to Dashboard"
              onPress={() => router.push("/student/dashboard")}
              className="items-center rounded-lg bg-blue-500 p-[14px]"
              textClassName="font-semibold text-white"
            />
        </ScrollView>
      </AnimatedScreen>
    </SafeAreaView>
  );
}
