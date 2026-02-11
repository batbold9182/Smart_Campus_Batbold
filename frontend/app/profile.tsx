import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { getProfile } from "../services/userService";
import useAuthGuard from "../hooks/useAuthGuard";

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");
  const router = useRouter();
  const { loading, user: authUser } = useAuthGuard();

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    router.replace("/login");
  };

  useEffect(() => {
    if (!loading && !authUser) {
      router.replace("/login");
    }
  }, [authUser, loading, router]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();
        setUser(data);
      } catch (err: any) {
        setError("❌ Not authenticated");
        console.log(err.response?.data || err.message);
      }
    };

    if (authUser) {
      loadProfile();
    }
  }, [authUser]);

  // 🔹 Auth guard loading
  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  if (!authUser) {
    return null;
  }

  // 🔹 Error state
  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  // 🔹 Still fetching profile
  if (!user) {
    return <Text>Loading profile...</Text>;
  }

  // ✅ FINAL UI (LOGOUT BUTTON WILL SHOW)
  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Profile</Text>
      <Text>Name: {user.name}</Text>
      <Text>Email: {user.email}</Text>
      <Text>Role: {user.role}</Text>
      {user.role === "admin" && (
        <Button title="Admin Panel" onPress={() => router.push("../admin")} />
      )}


      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    marginBottom: 12,
    textAlign: "center",
  },
  error: {
    color: "red",
    padding: 20,
  },
});

