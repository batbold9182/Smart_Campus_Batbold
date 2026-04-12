import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { register } from "../../services/authService";
import { haptic } from "../../utils/haptics";
import { AppButton, AppInput, AppCard } from "../../components/ui";

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
      haptic.error();
      setMessage("Please fill all fields.");
      return;
    }

    if (password.length < 6) {
      haptic.error();
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      haptic.error();
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);
      setMessage("");
      await register(cleanName, cleanEmail, password);
      haptic.success();
      setMessage("Account created. You can now log in.");
      setTimeout(() => {
        router.replace("/auth/login");
      }, 900);
    } catch (err: any) {
      haptic.error();
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
    <SafeAreaView className="flex-1 bg-app-bg">
      <KeyboardAvoidingView
        className="flex-1 px-5"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center py-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AppCard className="bg-app-surface rounded-[18px] p-5 elevation-4">
            <Text className="text-[28px] font-bold text-app-text text-center">Create Account</Text>
            <Text className="mt-1 mb-[18px] text-app-muted text-center">Register to access Vizja Smart Campus</Text>

            <AppInput
              placeholder="Full name"
              value={name}
              onChangeText={(value) => {
                setName(value);
                if (message) {
                  setMessage("");
                }
              }}
              className="rounded-xl border border-app-border bg-app-surface px-3 py-3 text-[16px] text-app-text mb-3"
              autoCapitalize="words"
              autoCorrect={false}
            />

            <AppInput
              placeholder="Email"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (message) {
                  setMessage("");
                }
              }}
              className="rounded-xl border border-app-border bg-app-surface px-3 py-3 text-[16px] text-app-text mb-3"
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />

            <AppInput
              placeholder="Password"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                if (message) {
                  setMessage("");
                }
              }}
              secureTextEntry
              className="rounded-xl border border-app-border bg-app-surface px-3 py-3 text-[16px] text-app-text mb-3"
              autoCorrect={false}
            />

            <AppInput
              placeholder="Confirm password"
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                if (message) {
                  setMessage("");
                }
              }}
              secureTextEntry
              className="rounded-xl border border-app-border bg-app-surface px-3 py-3 text-[16px] text-app-text mb-3"
              autoCorrect={false}
            />

            <AppButton
              title="Register"
              loading={isLoading}
              onPress={handleRegister}
              className={`mt-[6px] bg-blue-600 rounded-[10px] items-center justify-center min-h-[48px]${isLoading ? " opacity-70" : ""}`}
              textClassName="text-white text-[16px] font-bold"
            />

            {message ? <Text className="mt-[14px] text-center text-app-error">{message}</Text> : null}

            <AppButton
              title="Back to Login"
              variant="ghost"
              onPress={() => router.replace("/auth/login")}
              disabled={isLoading}
              className="mt-[10px] items-center justify-center min-h-[42px]"
              textClassName="text-blue-600 text-[14px] font-semibold"
            />
          </AppCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


