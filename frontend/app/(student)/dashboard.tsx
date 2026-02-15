import { View, Text, StyleSheet, Button, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import {logout} from "../../services/authService";
import { useRouter } from "expo-router";
import { getUnreadCount } from "../../services/notificationService";

export default function StudentDashboard() {
  const router = useRouter();
  const [count, setCount] = useState(0);

  const loadCount = async () => {
    try {
      const data = await getUnreadCount();
      setCount(data?.unreadCount ?? 0);
    } catch {
      setCount(0);
    }
  };

  useEffect(() => {
    loadCount();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎓 Student Dashboard</Text>
      <Text>Welcome, Student</Text>
      <TouchableOpacity onPress={() => router.push("/(student)/notifications")}> 
        <View style={styles.icon}>
          <Text style={{ fontSize: 24 }}>🔔</Text>

          {count > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{count}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
      <Button
        title="Profile"
        onPress={() => router.push("../profile")}
      />
      <Button
        title="Notifications"
        onPress={() => router.push("../notifications")}
      />
      <Button
        title="My Schedule"
        onPress={() => router.push("../schedule")}
      />
      {/*<Text>Assignment (optional)</Text>
      <Text> Schedule </Text>
      <Text>Upcoming exams </Text>
      <Text>Grades compareable (optional)</Text>
      <Text>Attendance shown as percentage</Text>
      <Text>Random chat named lunch buddy etc</Text>
      <Text>Notifications with emails , section</Text>
      <Text>Calendar section with holiday ,event , meeting everything shown </Text> // can be added in future */}
      <Button title="Logout" onPress={handleLogout} />
    </View>
      
  );
}

const styles = StyleSheet.create({
  icon: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    right: -6,
    top: -4,
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
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
