import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login } from "../services/authService";
import { router } from "expo-router";


export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    
    try {
      const data = await login(email, password);
      await AsyncStorage.setItem("token", data.token);
      setMessage("✅ Login successful!");
      const token = await AsyncStorage.getItem("token");
      console.log("TOKEN SAVED:", token);
      router.replace("/profile");
    } catch (err:any) {
      setMessage("❌ Login failed");
      console.error("Login error:", err.response?.data || err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smart Campus Login</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <Button title="Login" onPress={handleLogin} />

      {message ? <Text style={styles.message}>{message}</Text> : null}
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
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 12,
    borderRadius: 6,
  },
  message: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 16,
  },
});
