import { useEffect, useState } from "react";
import logger from "../../utils/logger";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import {
  assignCourse,
  createCourse,
  deleteCourse,
  getAllCourses,
} from "../../services/courseService";
import { getUsers } from "../../services/adminServices/adminService";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton, AppInput, AppCard } from "../../components/ui";

type Faculty = {
  _id: string;
  name: string;
  email: string;
};

type Course = {
  _id: string;
  title: string;
  code: string;
  faculty?: {
    _id: string;
    name: string;
    email: string;
  } | null;
};

export default function AdminCreateCourse() {
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [credits, setCredits] = useState("3");
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(null);
  const [facultySearch, setFacultySearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingFaculty, setLoadingFaculty] = useState(true);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const loadFaculty = async () => {
    try {
      setLoadingFaculty(true);
      const data = await getUsers(1, "faculty", 100);
      setFaculty(data.users || []);
    } catch (err: any) {
      setMessage("Failed to load faculty list");
    } finally {
      setLoadingFaculty(false);
    }
  };

  const loadCourses = async () => {
    try {
      const data = await getAllCourses();
      setCourses(data || []);
    } catch (err: any) {
      setMessage("Failed to load courses");
      logger.error(err.response?.data || err.message);
    }
  };

  useEffect(() => {
    loadFaculty();
    loadCourses();
  }, []);

  const handleCreate = async () => {
    if (!title || !code) {
      setMessage("Title and code are required");
      return;
    }

    if (!selectedFacultyId) {
      setMessage("Select a faculty member");
      return;
    }

    try {
      setLoading(true);
      await createCourse({
        title,
        code,
        description: description || undefined,
        credits: credits ? Number(credits) : undefined,
        facultyId: selectedFacultyId,
      });

      setTitle("");
      setCode("");
      setDescription("");
      setCredits("3");
      setSelectedFacultyId(null);
      setMessage("Course created and assigned");
      loadCourses();
    } catch (err: any) {
      setMessage(err?.response?.data?.message || "Failed to create course");
      logger.error(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (courseId: string) => {
    if (!selectedFacultyId) {
      setMessage("Select a faculty member");
      return;
    }

    try {
      setAssigningId(courseId);
      await assignCourse(courseId, selectedFacultyId);
      setMessage("Course assigned");
      loadCourses();
    } catch (err: any) {
      setMessage(err?.response?.data?.message || "Failed to assign course");
      logger.error(err.response?.data || err.message);
    } finally {
      setAssigningId(null);
    }
  };

  const handleDelete = async (courseId: string) => {
    try {
      setDeletingId(courseId);
      await deleteCourse(courseId);
      setMessage("Course deleted");
      loadCourses();
    } catch (err: any) {
      setMessage(err?.response?.data?.message || "Failed to delete course");
      logger.error(err.response?.data || err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={["top"]}>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-4" showsVerticalScrollIndicator={false}>
      <AppCard className="rounded-2xl border border-app-border-light bg-app-surface p-4 shadow-sm">
        <Text className="text-app-xl font-bold text-app-text">Create Course</Text>
        <Text className="mb-4 mt-1 text-app-sm text-app-muted">
          Add new courses and assign responsible faculty members.
        </Text>

        <View className="mb-3">
          <AppInput label="Title" placeholder="Course title" value={title} onChangeText={setTitle} />
        </View>
        <View className="mb-3">
          <AppInput label="Code" placeholder="e.g. CS101" value={code} onChangeText={setCode} />
        </View>
        <View className="mb-3">
          <AppInput label="Description" placeholder="Optional description" value={description} onChangeText={setDescription} />
        </View>
        <View className="mb-4">
          <AppInput label="Credits" placeholder="e.g. 3" value={credits} onChangeText={setCredits} keyboardType="numeric" />
        </View>

        <Text className="mb-2 text-app-base font-semibold text-app-text">Assign to Faculty</Text>
        {loadingFaculty && (
          <ActivityIndicator size="small" className="mb-2" />
        )}
        {!loadingFaculty && faculty.length > 0 && (
          <View className="mb-2">
            <AppInput
              placeholder="Search faculty by name or email"
              value={facultySearch}
              onChangeText={setFacultySearch}
            />
          </View>
        )}
        <FlatList
          data={faculty.filter((f) => {
            if (!facultySearch.trim()) return true;
            const q = facultySearch.trim().toLowerCase();
            return f.name.toLowerCase().includes(q) || f.email.toLowerCase().includes(q);
          })}
          keyExtractor={(item) => item._id}
          scrollEnabled={false}
          ListEmptyComponent={
            loadingFaculty ? null : <Text className="text-app-muted">No faculty found</Text>
          }
          renderItem={({ item }) => (
            <Pressable
              className={`mb-2 rounded-xl border p-3 ${
                selectedFacultyId === item._id ? "border-app-primary bg-app-primary-light" : "border-app-border bg-app-surface"
              }`}
              onPress={() => setSelectedFacultyId(item._id)}
            >
              <Text className="font-semibold text-app-text">{item.name}</Text>
              <Text className="text-app-muted">{item.email}</Text>
            </Pressable>
          )}
        />

        <View className="mt-2 mb-3">
          <AppButton
            title="Create and Assign"
            loading={loading}
            onPress={handleCreate}
          />
        </View>

        {message ? <Text className="mb-3 text-app-muted">{message}</Text> : null}

        <Text className="mb-2 text-app-base font-semibold text-app-text">Manage Courses</Text>
        <FlatList
          data={courses}
          keyExtractor={(item) => item._id}
          scrollEnabled={false}
          ListEmptyComponent={<Text className="text-app-muted">No courses found</Text>}
          renderItem={({ item }) => (
            <AppCard variant="bordered" className="mb-2 rounded-xl border border-app-border bg-app-surface p-3">
              <View className="mb-2">
                <Text className="font-semibold text-app-text">{item.title}</Text>
                <Text className="text-app-muted">{item.code}</Text>
                <Text className="text-app-muted">
                  Faculty: {item.faculty?.name || "Unassigned"}
                </Text>
              </View>
              <View className="gap-2 mt-2">
                <AppButton
                  title="Assign"
                  size="sm"
                  loading={assigningId === item._id}
                  onPress={() => handleAssign(item._id)}
                />
                <AppButton
                  title="Delete"
                  size="sm"
                  variant="danger"
                  loading={deletingId === item._id}
                  onPress={() => handleDelete(item._id)}
                />
              </View>
            </AppCard>
          )}
        />

        <AppButton
          title="Back to Dashboard"
          onPress={() => router.push("/admin/dashboard")}
        />
      </AppCard>
    </ScrollView>
    </SafeAreaView>
  );
}
