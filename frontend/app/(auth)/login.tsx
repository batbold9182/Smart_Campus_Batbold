import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login } from "../../services/authService";
import { router } from "expo-router";


export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    const nextEmailError = trimmedEmail ? "" : "Email is required.";
    const nextPasswordError = password ? "" : "Password is required.";
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    if (nextEmailError || nextPasswordError) {
      setMessage("❌ Please fix the errors below.");
      return;
    }

    setIsLoading(true);
    setMessage("");
    try {
      const data = await login(trimmedEmail, password);
      if (data?.user?.isActive === false) {
        setMessage("❌ Your account is deactivated. Please contact admin.");
        return;
      }
      if (!data?.token || !data?.user?.role) {
        setMessage("❌ Login failed. Please try again.");
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
      const status = err?.response?.status;
      const serverMessage = err?.response?.data?.message;
      if (status === 403 && serverMessage) {
        setMessage(`❌ ${serverMessage}`);
      } else if (status === 404) {
        setMessage("❌ User does not exist.");
      } else if (status === 401) {
        setMessage("❌ Wrong password. Please try again.");
      } else if (!err?.response) {
        setMessage("❌ Network error. Check your connection and try again.");
      } else {
        setMessage("❌ Login failed");
      }
      console.error(err?.response?.data || err?.message || err);
    } finally {
      setIsLoading(false);
    }
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smart Campus Login</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          if (emailError) {
            setEmailError("");
          }
          if (message) {
            setMessage("");
          }
        }}
        style={styles.input}
        autoCapitalize="none"
      />
      {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          if (passwordError) {
            setPasswordError("");
          }
          if (message) {
            setMessage("");
          }
        }}
        secureTextEntry
        style={styles.input}
      />
      {passwordError ? (
        <Text style={styles.fieldError}>{passwordError}</Text>
      ) : null}

      <Button
        title={isLoading ? "Logging in..." : "Login"}
        onPress={handleLogin}
        disabled={isLoading}
      />

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
  fieldError: {
    color: "#B00020",
    marginTop: -6,
    marginBottom: 10,
  },
});
