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

    if (password.length < 9) {
      haptic.error();
      setMessage("Password must be at least 9 characters.");
      return;
    } else if (password.length > 64) {
      haptic.error();
      setMessage("Password must be no more than 64 characters.");
      return;
    } else if (!/\d/.test(password)) {
      haptic.error();
      setMessage("Password must contain at least one number.");
      return;
    } else if (!/[A-Z]/.test(password)) {
      haptic.error();
      setMessage("Password must contain at least one uppercase letter.");
      return;
    } else if (!/[a-z]/.test(password)) {
      haptic.error();
      setMessage("Password must contain at least one lowercase letter.");
      return;
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      haptic.error();
      setMessage("Password must contain at least one special character.");
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
            <Text className="text-app-2xl font-bold text-app-text text-center">Create Account</Text>
            <Text className="mt-1 mb-[18px] text-app-muted text-center">Register to access Vizja Smart Campus</Text>

            <View className="mb-3">
              <AppInput
                label="Full Name"
                placeholder="Enter your full name"
                value={name}
                onChangeText={(value) => { setName(value); if (message) setMessage(""); }}
                autoCapitalize="words"
                autoCorrect={false}
                maxLength={100}
              />
            </View>

            <View className="mb-3">
              <AppInput
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={(value) => { setEmail(value); if (message) setMessage(""); }}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                maxLength={255}
              />
            </View>

            <View className="mb-3">
              <AppInput
                label="Password"
                placeholder="Min. 9 chars, upper, number, symbol"
                value={password}
                onChangeText={(value) => { setPassword(value); if (message) setMessage(""); }}
                secureTextEntry
                autoCorrect={false}
                maxLength={128}
              />
            </View>

            <View className="mb-4">
              <AppInput
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChangeText={(value) => { setConfirmPassword(value); if (message) setMessage(""); }}
                secureTextEntry
                autoCorrect={false}
                maxLength={128}
              />
            </View>

            <AppButton
              title="Register"
              loading={isLoading}
              onPress={handleRegister}
            />

            {message ? <Text className="mt-[14px] text-center text-app-error">{message}</Text> : null}

            <AppButton
              title="Back to Login"
              variant="ghost"
              onPress={() => router.replace("/auth/login")}
              disabled={isLoading}
            />
          </AppCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
