import { View, Text, StyleSheet, Button } from "react-native";
import {logout} from "../../services/authService";
import { useRouter } from "expo-router";

export default function StudentDashboard() {
  const router = useRouter();
  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎓 Student Dashboard</Text>
      <Text>Welcome, Student</Text>
      <Button
        title="Profile"
        onPress={() => router.push("../profile")}
      />
      <Text>Assignment (optional)</Text>
      <Text> Schedule </Text>
      <Text>Upcoming exams </Text>
      <Text>Grades compareable (optional)</Text>
      <Text>Attendance shown as percentage</Text>
      <Text>Random chat named lunch buddy etc</Text>
      <Text>Notifications with emails , section</Text>
      <Text>Calendar section with holiday ,event , meeting everything shown </Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
      
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
});
