import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { resetPassword } from "../../services/authService";
import { theme } from "../../styles/theme";

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ token?: string }>();
  const [token, setToken] = useState(typeof params.token === "string" ? params.token : "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    const cleanToken = token.trim();

    if (!cleanToken || !newPassword || !confirmPassword) {
      Alert.alert("Missing fields", "Token, new password, and confirm password are required.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Passwords do not match", "Please enter the same password in both fields.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      const response = await resetPassword(cleanToken, newPassword);
      setMessage(response.message);
      setTimeout(() => {
        router.replace("/(auth)/login");
      }, 1200);
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Enter your reset token and set a new password.</Text>

          <TextInput
            style={styles.input}
            placeholder="Reset token"
            placeholderTextColor="#6b7280"
            autoCapitalize="none"
            value={token}
            onChangeText={setToken}
          />

          <TextInput
            style={styles.input}
            placeholder="New password"
            placeholderTextColor="#6b7280"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm new password"
            placeholderTextColor="#6b7280"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
            onPress={handleReset}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Reset Password</Text>}
          </TouchableOpacity>

          {message ? <Text style={styles.message}>{message}</Text> : null}

          <TouchableOpacity style={styles.secondaryLink} onPress={() => router.replace("/(auth)/login")}>
            <Text style={styles.secondaryLinkText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.appBg,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 6,
  },
  subtitle: {
    color: theme.colors.muted,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.75,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  message: {
    marginTop: 12,
    color: theme.colors.muted,
  },
  secondaryLink: {
    marginTop: 14,
    alignItems: "center",
  },
  secondaryLinkText: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
});
