import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Pressable,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import {
  assignCourse,
  createCourse,
  deleteCourse,
  getAllCourses,
} from "../../services/courseService";
import { getUsers } from "../../services/adminService";
import { adminStyles } from "../../styles/adminStyles";

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
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const loadFaculty = async () => {
    try {
      const data = await getUsers(1, "faculty", 100);
      setFaculty(data.users || []);
    } catch (err: any) {
      setMessage("Failed to load faculty list");
      console.error(err.response?.data || err.message);
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
    <ScrollView className="flex-1 bg-[#f5f7fb]" contentContainerClassName="p-5 pb-6">
      <View className={adminStyles.card}>
        <Text className="mb-3 text-[22px] font-bold text-[#111827]">Create Course</Text>

        <TextInput
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          className={`${adminStyles.input} mb-3`}
        />
        <TextInput
          placeholder="Code (e.g. CS101)"
          value={code}
          onChangeText={setCode}
          className={`${adminStyles.input} mb-3`}
        />
        <TextInput
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          className={`${adminStyles.input} mb-3`}
        />
        <TextInput
          placeholder="Credits"
          value={credits}
          onChangeText={setCredits}
          keyboardType="numeric"
          className={`${adminStyles.input} mb-4`}
        />

        <Text className="mb-2 text-[16px] font-semibold text-[#111827]">Assign to Faculty</Text>
        <FlatList
          data={faculty}
          keyExtractor={(item) => item._id}
          scrollEnabled={false}
          ListEmptyComponent={<Text className="text-[#6b7280]">No faculty found</Text>}
          renderItem={({ item }) => (
            <Pressable
              className={`mb-2 rounded-lg border p-3 ${
                selectedFacultyId === item._id ? "border-blue-400 bg-blue-50" : "border-[#d1d5db] bg-white"
              }`}
              onPress={() => setSelectedFacultyId(item._id)}
            >
              <Text className="font-semibold text-[#111827]">{item.name}</Text>
              <Text className="text-[#555]">{item.email}</Text>
            </Pressable>
          )}
        />

        <View className="mt-2 mb-3">
          <Button
            title={loading ? "Creating..." : "Create and Assign"}
            onPress={handleCreate}
          />
        </View>

        {message ? <Text className="mb-3 text-[#374151]">{message}</Text> : null}

        <Text className="mb-2 text-[16px] font-semibold text-[#111827]">Manage Courses</Text>
        <FlatList
          data={courses}
          keyExtractor={(item) => item._id}
          scrollEnabled={false}
          ListEmptyComponent={<Text className="text-[#6b7280]">No courses found</Text>}
          renderItem={({ item }) => (
            <View className="mb-2 rounded-lg border border-[#d1d5db] p-3">
              <View className="mb-2">
                <Text className="font-semibold text-[#111827]">{item.title}</Text>
                <Text>{item.code}</Text>
                <Text className="text-[#555]">
                  Faculty: {item.faculty?.name || "Unassigned"}
                </Text>
              </View>
              <View className="gap-2">
                <Button
                  title={assigningId === item._id ? "Assigning..." : "Assign"}
                  onPress={() => handleAssign(item._id)}
                />
                <Button
                  title={deletingId === item._id ? "Deleting..." : "Delete"}
                  color="red"
                  onPress={() => handleDelete(item._id)}
                />
              </View>
            </View>
          )}
        />

        <Button title="Back to dashboard" onPress={() => router.push("../dashboard")} />
      </View>
    </ScrollView>
  );
}
