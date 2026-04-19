import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { getStudentGrades, type StudentGradesResponse } from "../../services/facultyServices/gradeService";
import ScreenLayout from "../../components/ScreenLayout";
import { SkeletonStatRow, SkeletonList } from "../../components/Skeleton";
import { AppButton } from "../../components/ui";

export default function Grades() {
  const router = useRouter();
  const [data, setData] = useState<StudentGradesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGrades = async () => {
      try {
        const response = await getStudentGrades();
        setData(response);
      } finally {
        setLoading(false);
      }
    };

    loadGrades();
  }, []);

  if (loading) {
    return (
      <ScreenLayout title="Grades" backRoute="/student/dashboard">
        <SkeletonStatRow count={3} />
        <SkeletonList rows={3} />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title="Grades" backRoute="/student/dashboard">

        <View className="mb-4 flex-row justify-between gap-2">
          <View className="flex-1 rounded-xl bg-app-surface p-4 shadow-card">
            <Text className="text-[20px] font-bold text-app-text">{data?.summary.courseCount || 0}</Text>
            <Text className="mt-1 text-[12px] text-app-muted">Courses</Text>
          </View>
          <View className="flex-1 rounded-xl bg-app-surface p-4 shadow-card">
            <Text className="text-[20px] font-bold text-app-text">{data?.summary.gradedCount || 0}</Text>
            <Text className="mt-1 text-[12px] text-app-muted">Published Grades</Text>
          </View>
          <View className="flex-1 rounded-xl bg-app-surface p-4 shadow-card">
            <Text className="text-[20px] font-bold text-app-text">{data?.summary.averageGrade ?? "-"}</Text>
            <Text className="mt-1 text-[12px] text-app-muted">Average</Text>
          </View>
        </View>

        {!data?.items.length ? (
          <View className="mb-4 rounded-xl bg-app-surface p-4 shadow-card">
            <Text className="mb-2 text-[16px] font-semibold text-app-text">No Grades Yet</Text>
            <Text className="text-app-muted">Your published course grades will appear here once faculty submit them.</Text>
          </View>
        ) : (
          data.items.map((item) => {
            const gradeValue = item.grade?.value;
            const badgeClassName = gradeValue === undefined || gradeValue === null
              ? "bg-gray-100"
              : gradeValue >= 5
                ? "bg-green-100"
                : gradeValue >= 3
                  ? "bg-blue-100"
                  : "bg-amber-100";

            return (
              <View key={item.course.id} className="mb-4 rounded-xl bg-app-surface p-4 shadow-card">
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-[16px] font-semibold text-app-text">{item.course.title}</Text>
                    <Text className="mt-1 text-app-muted">{item.course.code} � {item.course.credits} credits</Text>
                    <Text className="mt-1 text-app-placeholder">Faculty: {item.course.facultyName}</Text>
                  </View>
                  <View className={`rounded-full px-3 py-2 ${badgeClassName}`}>
                    <Text className="text-[12px] font-semibold text-app-text">
                      {gradeValue ?? "Pending"}
                    </Text>
                  </View>
                </View>

                {item.grade?.remarks ? (
                  <View className="mt-4 rounded-lg bg-app-bg-subtle p-3">
                    <Text className="text-[12px] font-semibold uppercase tracking-[0.5px] text-app-muted">Remarks</Text>
                    <Text className="mt-2 text-app-text-secondary">{item.grade.remarks}</Text>
                  </View>
                ) : null}
              </View>
            );
          })
        )}

        <AppButton onPress={() => router.push("/student/dashboard")}>
          Back to Dashboard
        </AppButton>
    </ScreenLayout>
  );
}
