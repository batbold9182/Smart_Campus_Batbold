import { View, Text, Button, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import {logout} from "../../services/authService";
import { useEffect, useState } from "react";
import { getUnreadCount } from "../../services/notificationService";

export default function FacultyDashboard() {
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
      <Text style={styles.title}>🎓 Faculty Dashboard</Text>
      <TouchableOpacity onPress={() => router.push("../(faculty)/notifications")}>
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
        title="My Courses"
        onPress={() => router.push("../(faculty)/courses")}
      />

      <Button
        title="Profile"
        onPress={() => router.push("../profile")}
      />
      <Button
        title="Notifications"
        onPress={() => router.push("../(faculty)/notifications")}
      />
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    position: "relative",
    alignSelf: "center",
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
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 22,
    textAlign: "center",
    marginBottom: 20,
  },
});
