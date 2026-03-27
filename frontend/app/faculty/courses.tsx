import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { getMyCourses } from "../../services/courseService";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { facultyStyles } from "../../styles/facultyStyles";

export default function FacultyCoursesScreen() {
  const [courses, setCourses] = useState<any[]>([]);
  const router = useRouter();

  const loadCourses = async () => {
    const data = await getMyCourses();
    setCourses(data || []);
  };

  useEffect(() => {
    loadCourses();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={["top"]}>
      <View className="flex-1 px-5 pb-4">
        <Text className={`mb-4 ${facultyStyles.title}`}>My Courses</Text>

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

        <TouchableOpacity
          className={`mt-3 ${facultyStyles.buttonPrimary}`}
          onPress={() => router.push("/faculty/dashboard")}
        >
          <Text className={facultyStyles.buttonPrimaryText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
