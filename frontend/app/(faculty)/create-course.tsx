import { useState } from "react";
import { View, TextInput, Button } from "react-native";
import api from "../../config/clientAPI";
import { useRouter } from "expo-router";

export default function CreateCourse() {
  const [title, setTitle] = useState("");
  const router = useRouter();

  const handleCreate = async () => {
    await api.post("/api/faculty/courses", { title });
    router.replace("../(faculty)/courses");
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Course Title"
        value={title}
        onChangeText={setTitle}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <Button title="Create Course" onPress={handleCreate} />
    </View>
  );
}
