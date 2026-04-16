import { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { getMyCourses } from "../../services/courseService";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { facultyStyles } from "../../styles/facultyStyles";
import { AppButton } from "../../components/ui";

export default function FacultyCoursesScreen() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getMyCourses();
      setCourses(data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={["top"]}>
      <View className="flex-1 px-5 pb-4">
        <Text className={`mb-4 ${facultyStyles.title}`}>My Courses</Text>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" />
          </View>
        ) : error ? (
          <View className={`mb-4 ${facultyStyles.card}`}>
            <Text className="text-app-error text-center mb-3">{error}</Text>
            <AppButton onPress={loadCourses}>Retry</AppButton>
          </View>
        ) : (
          <>
            <View className={`mb-4 ${facultyStyles.card}`}>
              <Text className={facultyStyles.muted}>Total Assigned Courses: {courses.length}</Text>
            </View>

            <FlatList
              data={courses}
              keyExtractor={(item) => item._id}
              ListEmptyComponent={
                <View className={facultyStyles.card}>
                  <Text className={`text-center ${facultyStyles.muted}`}>No courses assigned yet</Text>
                </View>
              }
              renderItem={({ item }) => (
                <View className={`mb-3 ${facultyStyles.card}`}>
                  <Text className="text-[16px] font-bold text-app-text">{item.title || "Untitled Course"}</Text>
                  <Text className={`mt-1 ${facultyStyles.muted}`}>Code: {item.code || "-"}</Text>
                </View>
              )}
            />
          </>
        )}

        <AppButton
          className="mt-3"
          onPress={() => router.push("/faculty/dashboard")}
        >
          Back to Dashboard
        </AppButton>
      </View>
    </SafeAreaView>
  );
}
