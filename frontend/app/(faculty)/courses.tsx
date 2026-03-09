import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { getMyCourses } from "../../services/courseService";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

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
    <SafeAreaView className="flex-1 bg-[#f5f7fb]" edges={["top"]}>
      <View className="flex-1 px-5 pb-4">
        <Text className="mb-4 text-[22px] font-bold text-[#111827]">My Courses</Text>

        <View className="mb-4 rounded-xl bg-white p-4 shadow">
          <Text className="text-[#6b7280]">Total Assigned Courses: {courses.length}</Text>
        </View>

        <FlatList
          data={courses}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={
            <View className="rounded-xl bg-white p-4 shadow">
              <Text className="text-center text-[#6b7280]">No courses assigned yet</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View className="mb-3 rounded-xl bg-white p-4 shadow">
              <Text className="text-[16px] font-bold text-[#111827]">{item.title || "Untitled Course"}</Text>
              <Text className="mt-1 text-[#6b7280]">Code: {item.code || "-"}</Text>
            </View>
          )}
        />

        <TouchableOpacity
          className="mt-3 items-center rounded-lg bg-blue-500 p-[14px]"
          onPress={() => router.push("/(faculty)/dashboard")}
        >
          <Text className="font-semibold text-white">Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
