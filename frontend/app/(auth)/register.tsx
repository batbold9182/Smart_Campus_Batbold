import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { register } from "../../services/authService";
import { theme } from "../../styles/theme";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password || !confirmPassword) {
      setMessage("Please fill all fields.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);
      setMessage("");
      await register(cleanName, cleanEmail, password);
      setMessage("Account created. You can now log in.");
      setTimeout(() => {
        router.replace("/(auth)/login");
      }, 900);
    } catch (err: any) {
      const status = err?.response?.status;
      const serverMessage = err?.response?.data?.message;

      if (status === 400 && serverMessage) {
        setMessage(serverMessage);
      } else if (!err?.response) {
        setMessage("Network error. Check your connection and try again.");
      } else {
        setMessage("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Register to access Vizja Smart Campus</Text>

            <TextInput
              placeholder="Full name"
              placeholderTextColor="#6b7280"
              value={name}
              onChangeText={(value) => {
                setName(value);
                if (message) {
                  setMessage("");
                }
              }}
              style={styles.input}
              autoCapitalize="words"
              autoCorrect={false}
            />

            <TextInput
              placeholder="Email"
              placeholderTextColor="#6b7280"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (message) {
                  setMessage("");
                }
              }}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />

            <TextInput
              placeholder="Password"
              placeholderTextColor="#6b7280"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                if (message) {
                  setMessage("");
                }
              }}
              secureTextEntry
              style={styles.input}
              autoCorrect={false}
            />

            <TextInput
              placeholder="Confirm password"
              placeholderTextColor="#6b7280"
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                if (message) {
                  setMessage("");
                }
              }}
              secureTextEntry
              style={styles.input}
              autoCorrect={false}
            />

            <TouchableOpacity
              style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.primaryButtonText}>Register</Text>
              )}
            </TouchableOpacity>

            {message ? <Text style={styles.message}>{message}</Text> : null}

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.replace("/(auth)/login")}
              disabled={isLoading}
            >
              <Text style={styles.secondaryButtonText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.appBg,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 24,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 20,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.text,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 18,
    color: theme.colors.muted,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    borderRadius: 10,
  },
  primaryButton: {
    marginTop: 6,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 42,
  },
  secondaryButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  message: {
    marginTop: 14,
    textAlign: "center",
    color: theme.colors.danger,
  },
});
