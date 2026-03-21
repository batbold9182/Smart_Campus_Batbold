import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { register } from "../../services/authService";
import { rootStyles } from "../../styles/rootStyles";

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
          <View className="bg-app-surface rounded-[18px] p-5 elevation-4">
            <Text className="text-[28px] font-bold text-app-text text-center">Create Account</Text>
            <Text className="mt-1 mb-[18px] text-app-muted text-center">Register to access Vizja Smart Campus</Text>

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
              className={rootStyles.input + " mb-3"}
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
              className={rootStyles.input + " mb-3"}
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
              className={rootStyles.input + " mb-3"}
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
              className={rootStyles.input + " mb-3"}
              autoCorrect={false}
            />

            <TouchableOpacity
              className={`mt-[6px] bg-blue-600 rounded-[10px] items-center justify-center min-h-[48px]${isLoading ? " opacity-70" : ""}`}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white text-[16px] font-bold">Register</Text>
              )}
            </TouchableOpacity>

            {message ? <Text className="mt-[14px] text-center text-[#b91c1c]">{message}</Text> : null}

            <TouchableOpacity
              className="mt-[10px] items-center justify-center min-h-[42px]"
              onPress={() => router.replace("/(auth)/login")}
              disabled={isLoading}
            >
              <Text className="text-blue-600 text-[14px] font-semibold">Back to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


