import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";

export default function CreateCourse() {
  const router = useRouter();

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ marginBottom: 12 }}>
        Only admins can create and assign courses.
      </Text>
      <Button title="Back to courses" onPress={() => router.push("../courses")} />
    </View>
  );
}
