import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { login } from "../../services/authService";
import { router } from "expo-router";
import { setToken } from "../../services/tokenStorage";
import { theme } from "../../styles/theme";


export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const [email, setEmail] = useState("");
    const logoSize = Math.max(68, Math.min(96, Math.round(width * 0.12)));

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

      await setToken(data.token);

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
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.backgroundShapeTop} />
        <View style={styles.backgroundShapeBottom} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Image
              source={require("../../assets/images/Logo_VIZJA.png")}
              style={[styles.logo, { width: logoSize, height: logoSize }]}
              resizeMode="contain"
            />
            <Text style={styles.brand}>Vizja Smart Campus</Text>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue to your dashboard</Text>

            <TextInput
              placeholder="Email"
              placeholderTextColor="#6b7280"
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
              keyboardType="email-address"
              autoCorrect={false}
              textContentType="emailAddress"
              autoComplete="email"
            />
            {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}

            <TextInput
              placeholder="Password"
              placeholderTextColor="#6b7280"
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
              autoCorrect={false}
              textContentType="password"
              autoComplete="password"
            />
            {passwordError ? <Text style={styles.fieldError}>{passwordError}</Text> : null}

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>

            {message ? <Text style={styles.message}>{message}</Text> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  logo:{
    alignSelf: "center",
    marginBottom: 8,
  },
  safe: {
    flex: 1,
    backgroundColor: theme.colors.appBg,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    position: "relative",
    overflow: "hidden",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 24,
  },
  backgroundShapeTop: {
    position: "absolute",
    top: -120,
    right: -100,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#c7dcff",
  },
  backgroundShapeBottom: {
    position: "absolute",
    bottom: -130,
    left: -120,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#d9e8ff",
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 20,
    boxShadow: "0px 8px 14px rgba(0, 0, 0, 0.08)",
    elevation: 4,
  },
  brand: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.primary,
    marginBottom: 6,
    textAlign: "center",
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
  loginButton: {
    marginTop: 6,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: "700",
  },
  message: {
    marginTop: 14,
    textAlign: "center",
    color: theme.colors.danger,
  },
  fieldError: {
    color: theme.colors.fieldError,
    marginTop: -6,
    marginBottom: 10,
  },
});
