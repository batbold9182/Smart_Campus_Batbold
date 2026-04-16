import { useEffect, useState } from "react";
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
      console.error(err.response?.data || err.message);
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
      console.error(err.response?.data || err.message);
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
      console.error(err.response?.data || err.message);
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
      console.error(err.response?.data || err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={["top"]}>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-4" showsVerticalScrollIndicator={false}>
      <AppCard className="rounded-2xl border border-app-border-light bg-app-surface p-4 shadow-sm">
        <Text className="text-[24px] font-bold text-app-text">Create Course</Text>
        <Text className="mb-4 mt-1 text-[13px] text-app-muted">
          Add new courses and assign responsible faculty members.
        </Text>

        <AppInput
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          className="rounded-xl border border-app-border bg-app-surface px-3 py-3 text-[16px] text-app-text mb-3"
        />
        <AppInput
          placeholder="Code (e.g. CS101)"
          value={code}
          onChangeText={setCode}
          className="rounded-xl border border-app-border bg-app-surface px-3 py-3 text-[16px] text-app-text mb-3"
        />
        <AppInput
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          className="rounded-xl border border-app-border bg-app-surface px-3 py-3 text-[16px] text-app-text mb-3"
        />
        <AppInput
          placeholder="Credits"
          value={credits}
          onChangeText={setCredits}
          keyboardType="numeric"
          className="rounded-xl border border-app-border bg-app-surface px-3 py-3 text-[16px] text-app-text mb-4"
        />

        <Text className="mb-2 text-[16px] font-semibold text-app-text">Assign to Faculty</Text>
        {loadingFaculty && (
          <ActivityIndicator size="small" className="mb-2" />
        )}
        <FlatList
          data={faculty}
          keyExtractor={(item) => item._id}
          scrollEnabled={false}
          ListEmptyComponent={
            loadingFaculty ? null : <Text className="text-app-muted">No faculty found</Text>
          }
          renderItem={({ item }) => (
            <Pressable
              className={`mb-2 rounded-xl border p-3 ${
                selectedFacultyId === item._id ? "border-blue-400 bg-blue-50" : "border-app-border bg-app-surface"
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
            title={loading ? "Creating..." : "Create and Assign"}
            loading={loading}
            onPress={handleCreate}
            className={`items-center rounded-xl px-4 py-3 ${loading ? "bg-app-primary-loading" : "bg-blue-500"}`}
            textClassName="font-semibold text-white"
          />
        </View>

        {message ? <Text className="mb-3 text-app-muted">{message}</Text> : null}

        <Text className="mb-2 text-[16px] font-semibold text-app-text">Manage Courses</Text>
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
              <View className="gap-2">
                <AppButton
                  title={assigningId === item._id ? "Assigning..." : "Assign"}
                  loading={assigningId === item._id}
                  onPress={() => handleAssign(item._id)}
                  className={`items-center rounded-lg px-3 py-2 ${assigningId === item._id ? "bg-app-primary-loading" : "bg-blue-500"}`}
                  textClassName="font-semibold text-white"
                />
                <AppButton
                  title={deletingId === item._id ? "Deleting..." : "Delete"}
                  variant="danger"
                  loading={deletingId === item._id}
                  onPress={() => handleDelete(item._id)}
                  className={`items-center rounded-lg px-3 py-2 ${deletingId === item._id ? "bg-app-error-loading" : "bg-red-500"}`}
                  textClassName="font-semibold text-white"
                />
              </View>
            </AppCard>
          )}
        />

        <AppButton
          title="Back to Dashboard"
          variant="outline"
          onPress={() => router.push("/admin/dashboard")}
          className="items-center rounded-xl border border-app-border bg-app-surface px-4 py-3"
          textClassName="font-semibold text-app-text"
        />
      </AppCard>
    </ScrollView>
    </SafeAreaView>
  );
}
