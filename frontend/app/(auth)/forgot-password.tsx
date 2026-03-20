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
import { router } from "expo-router";
import { forgotPassword } from "../../services/authService";
import { theme } from "../../styles/theme";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [devToken, setDevToken] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      Alert.alert("Email required", "Please enter your email.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setDevToken("");
      const response = await forgotPassword(cleanEmail);
      setMessage(response.message);

      if (response.resetToken) {
        setDevToken(response.resetToken);
      }
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Failed to request password reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>Enter your account email to generate a reset token.</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#6b7280"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
            onPress={handleRequestReset}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Send Reset Token</Text>}
          </TouchableOpacity>

          {message ? <Text style={styles.message}>{message}</Text> : null}

          {devToken ? (
            <View style={styles.devCard}>
              <Text style={styles.devTitle}>Development Token</Text>
              <Text selectable style={styles.devToken}>{devToken}</Text>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => router.push({ pathname: "/(auth)/reset-password", params: { token: devToken } })}
              >
                <Text style={styles.secondaryButtonText}>Continue to Reset Password</Text>
              </TouchableOpacity>
            </View>
          ) : null}

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
  devCard: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#f8fafc",
  },
  devTitle: {
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 6,
  },
  devToken: {
    color: "#374151",
    marginBottom: 10,
  },
  secondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: theme.colors.primary,
    fontWeight: "700",
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
