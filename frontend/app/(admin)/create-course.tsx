import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import {
  assignCourse,
  createCourse,
  deleteCourse,
  getAllCourses,
} from "../../services/courseService";
import { getUsers } from "../../services/adminService";

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
    <View style={styles.container}>
      <Text style={styles.title}>Create Course</Text>

      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        placeholder="Code (e.g. CS101)"
        value={code}
        onChangeText={setCode}
        style={styles.input}
      />
      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />
      <TextInput
        placeholder="Credits"
        value={credits}
        onChangeText={setCredits}
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.sectionTitle}>Assign to Faculty</Text>
      <FlatList
        data={faculty}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={<Text>No faculty found</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.facultyRow,
              selectedFacultyId === item._id && styles.facultySelected,
            ]}
            onPress={() => setSelectedFacultyId(item._id)}
          >
            <Text style={styles.facultyName}>{item.name}</Text>
            <Text style={styles.facultyEmail}>{item.email}</Text>
          </Pressable>
        )}
      />

      <Button
        title={loading ? "Creating..." : "Create and Assign"}
        onPress={handleCreate}
      />

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <Text style={styles.sectionTitle}>Manage Courses</Text>
      <FlatList
        data={courses}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={<Text>No courses found</Text>}
        renderItem={({ item }) => (
          <View style={styles.courseRow}>
            <View style={styles.courseInfo}>
              <Text style={styles.courseTitle}>{item.title}</Text>
              <Text>{item.code}</Text>
              <Text style={styles.courseFaculty}>
                Faculty: {item.faculty?.name || "Unassigned"}
              </Text>
            </View>
            <View style={styles.courseActions}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
  },
  facultyRow: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  facultySelected: {
    backgroundColor: "#e6f4ff",
    borderColor: "#3399ff",
  },
  facultyName: {
    fontWeight: "bold",
  },
  facultyEmail: {
    color: "#555",
  },
  message: {
    marginTop: 6,
  },
  courseRow: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  courseInfo: {
    marginBottom: 8,
  },
  courseTitle: {
    fontWeight: "bold",
  },
  courseFaculty: {
    color: "#555",
  },
  courseActions: {
    gap: 8,
  },
});
