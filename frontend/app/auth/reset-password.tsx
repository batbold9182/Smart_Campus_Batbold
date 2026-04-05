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
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(typeof params.email === "string" ? params.email : "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    const cleanOtp = otp.trim();

    if (!email || !cleanOtp || !newPassword || !confirmPassword) {
      Alert.alert("Missing fields", "Email, OTP, new password, and confirm password are required.");
      return;
    }

    if (cleanOtp.length !== 6) {
      Alert.alert("Invalid OTP", "Please enter the 6-digit OTP.");
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
      const response = await resetPassword(email.trim(), cleanOtp, newPassword);
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
          <Text className="text-app-muted mb-4">Enter the 6-digit OTP sent to your email and set a new password.</Text>

          <TextInput
            className={rootStyles.input + " mb-3"}
            placeholder="Email"
            placeholderTextColor="#6b7280"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            className={rootStyles.input + " mb-3 text-center text-xl tracking-[8px]"}
            placeholder="000000"
            placeholderTextColor="#6b7280"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
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

          <TouchableOpacity className="`bg-blue-600 rounded-[10px] min-h-[48px] items-center justify-center" onPress={() => router.replace("/auth/forgot-password")}>
            <Text className="text-blue-600 font-semibold">Get one time password</Text>
          </TouchableOpacity>

          {message ? <Text className="mt-3 text-app-muted">{message}</Text> : null}

          <TouchableOpacity className="mt-[14px] items-center" onPress={() => router.replace("/auth/login")}>
            <Text className="text-blue-600 font-semibold">Back to login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
