import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { getStudentGrades, type StudentGradesResponse } from "../../services/facultyServices/gradeService";

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
      <SafeAreaView className="flex-1 items-center justify-center bg-[#f5f7fb]" edges={["top"]}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-3 text-[#6b7280]">Loading grades...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f5f7fb]" edges={["top"]}>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-5">
        <Text className="mb-4 text-[22px] font-bold text-[#111827]">Grades</Text>

        <View className="mb-4 flex-row justify-between gap-2">
          <View className="flex-1 rounded-xl bg-white p-4 shadow">
            <Text className="text-[20px] font-bold text-[#111827]">{data?.summary.courseCount || 0}</Text>
            <Text className="mt-1 text-[12px] text-[#6b7280]">Courses</Text>
          </View>
          <View className="flex-1 rounded-xl bg-white p-4 shadow">
            <Text className="text-[20px] font-bold text-[#111827]">{data?.summary.gradedCount || 0}</Text>
            <Text className="mt-1 text-[12px] text-[#6b7280]">Published Grades</Text>
          </View>
          <View className="flex-1 rounded-xl bg-white p-4 shadow">
            <Text className="text-[20px] font-bold text-[#111827]">{data?.summary.averageGrade ?? "-"}</Text>
            <Text className="mt-1 text-[12px] text-[#6b7280]">Average</Text>
          </View>
        </View>

        {!data?.items.length ? (
          <View className="mb-4 rounded-xl bg-white p-4 shadow">
            <Text className="mb-2 text-[16px] font-semibold text-[#111827]">No Grades Yet</Text>
            <Text className="text-[#6b7280]">Your published course grades will appear here once faculty submit them.</Text>
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
              <View key={item.course.id} className="mb-4 rounded-xl bg-white p-4 shadow">
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-[16px] font-semibold text-[#111827]">{item.course.title}</Text>
                    <Text className="mt-1 text-[#6b7280]">{item.course.code} • {item.course.credits} credits</Text>
                    <Text className="mt-1 text-[#9ca3af]">Faculty: {item.course.facultyName}</Text>
                  </View>
                  <View className={`rounded-full px-3 py-2 ${badgeClassName}`}>
                    <Text className="text-[12px] font-semibold text-[#1f2937]">
                      {gradeValue ?? "Pending"}
                    </Text>
                  </View>
                </View>

                {item.grade?.remarks ? (
                  <View className="mt-4 rounded-lg bg-[#f9fafb] p-3">
                    <Text className="text-[12px] font-semibold uppercase tracking-[0.5px] text-[#6b7280]">Remarks</Text>
                    <Text className="mt-2 text-[#374151]">{item.grade.remarks}</Text>
                  </View>
                ) : null}
              </View>
            );
          })
        )}

        <TouchableOpacity
          className="items-center rounded-lg bg-blue-500 p-[14px]"
          onPress={() => router.push("/student/dashboard")}
        >
          <Text className="font-semibold text-white">Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
