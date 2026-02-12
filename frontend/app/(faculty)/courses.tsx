import { useEffect, useState } from "react";
import { View, Text, Button, FlatList, StyleSheet } from "react-native";
import { getMyCourses } from "../../services/courseService";
import { useRouter } from "expo-router";

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
    <View style={styles.container}>
      <Text style={styles.header}>📚 My Courses</Text>

      <Button
        title="Back to dashboard"
        onPress={() => router.push("../dashboard")}
      />

      {/* COURSE LIST */}
      <FlatList
        data={courses}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={<Text>No courses yet</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.courseTitle}>{item.title}</Text>
            <Text>{item.code}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  courseTitle: {
    fontWeight: "bold",
  },
});
