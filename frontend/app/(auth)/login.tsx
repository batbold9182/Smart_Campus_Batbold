import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login } from "../../services/authService";
import { router } from "expo-router";


export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    try {
      const data = await login(email, password);
      if (data.user.isActive === false) {
        setMessage("❌ Your account is deactivated. Please contact admin.");
        return;
      }
      await AsyncStorage.setItem("token", data.token);

    if (data.user.role === "admin") {
      router.replace("/(admin)/dashboard");
    } else if (data.user.role === "faculty") {
      router.replace("/(faculty)/dashboard");
    } else {
      router.replace("/(student)/dashboard");
    }

  } catch (err: any) {
    const status = err.response?.status;
    const serverMessage = err.response?.data?.message;
    if (status === 403 && serverMessage) {
      setMessage(`❌ ${serverMessage}`);
    } else {
      setMessage("❌ Login failed");
    }
    console.error(err.response?.data || err.message);
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
