import { View, Text, StyleSheet,Button } from "react-native";
import useAuthGuard from "../../hooks/useAuthGuard";
import { useEffect, useState } from "react";
import { getProfile } from "../../services/userService";
import { useRouter } from "expo-router";
import { logout } from "../../services/authService";

export default function AdminDashboard() {
  const { loading, user: authUser } = useAuthGuard();
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  }
  useEffect(() => {
    if (!loading && !authUser) {
      router.replace("/login");
    }
  }, [authUser, loading, router]);

  useEffect(() => {
    const load = async () => {
      const profile = await getProfile();

      if (profile.role !== "admin") {
        router.replace("/profile");
        return;
      }

      setUser(profile);
    };

    if (authUser) {
      load();
    }
  }, [authUser, router]);

  if (loading) {
    return <Text style={styles.loading}>Loading admin panel...</Text>;
  }

  if (!authUser || !user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛠 Admin Dashboard</Text>
      <Text>Welcome, {user.name}</Text>

      <View style={styles.card}>
        <Text>📚 Manage Courses</Text>
      </View>

      <View style={styles.card}>
        <Text>👥 Manage Users</Text>
      </View>
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  card: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  loading: {
    marginTop: 50,
    textAlign: "center",
  },
});
