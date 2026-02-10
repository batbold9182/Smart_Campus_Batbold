import { View, Text, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import {logout} from "../../services/authService";
export default function FacultyDashboard() {
  const router = useRouter();
  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎓 Faculty Dashboard</Text>

      <Button
        title="My Courses"
        onPress={() => router.push("../(faculty)/courses")}
      />

      <Button
        title="Create Course"
        onPress={() => router.push("../(faculty)/create-course")}
      />

      <Button
        title="Profile"
        onPress={() => router.push("../profile")}
      />
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 22,
    textAlign: "center",
    marginBottom: 20,
  },
});
