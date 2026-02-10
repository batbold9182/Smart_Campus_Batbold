import { View, Text, FlatList } from "react-native";
import { useEffect, useState } from "react";
import api from "../../config/clientAPI";

export default function FacultyCourses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.get("/api/faculty/courses").then((res) => {
      setCourses(res.data);
    });
  }, []);

  return (
    <FlatList
      data={courses}
      keyExtractor={(item: any) => item._id}
      renderItem={({ item }: any) => (
        <View style={{ padding: 12 }}>
          <Text>📘 {item.title}</Text>
        </View>
      )}
    />
  );
}
