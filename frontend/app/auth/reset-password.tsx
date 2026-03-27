import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { resetPassword } from "../../services/authService";
import { rootStyles } from "../../styles/rootStyles";

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
        router.replace("/auth/login");
      }, 1200);
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-app-bg">
      <ScrollView contentContainerClassName="flex-grow justify-center p-5" keyboardShouldPersistTaps="handled">
        <View className="bg-app-surface rounded-2xl p-5 elevation-3">
          <Text className="text-[24px] font-bold text-app-text mb-[6px]">Reset Password</Text>
          <Text className="text-app-muted mb-4">Enter your reset token and set a new password.</Text>

          <TextInput
            className={rootStyles.input + " mb-3"}
            placeholder="Reset token"
            placeholderTextColor="#6b7280"
            autoCapitalize="none"
            value={token}
            onChangeText={setToken}
          />

          <TextInput
            className={rootStyles.input + " mb-3"}
            placeholder="New password"
            placeholderTextColor="#6b7280"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <TextInput
            className={rootStyles.input + " mb-3"}
            placeholder="Confirm new password"
            placeholderTextColor="#6b7280"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity
            className={`bg-blue-600 rounded-[10px] min-h-[48px] items-center justify-center${loading ? " opacity-75" : ""}`}
            onPress={handleReset}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-[15px] font-bold">Reset Password</Text>}
          </TouchableOpacity>

          {message ? <Text className="mt-3 text-app-muted">{message}</Text> : null}

          <TouchableOpacity className="mt-[14px] items-center" onPress={() => router.replace("/auth/login")}>
            <Text className="text-blue-600 font-semibold">Back to Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
