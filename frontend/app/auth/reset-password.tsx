import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { resetPassword } from "../../services/authService";
import { AppButton, AppInput, AppCard } from "../../components/ui";

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

    if (newPassword.length < 9) {
      Alert.alert("Weak password", "Password must be at least 9 characters.");
      return;
    } else if (newPassword.length > 64) {
      Alert.alert("Weak password", "Password must be no more than 64 characters.");
      return;
    } else if (!/\d/.test(newPassword)) {
      Alert.alert("Weak password", "Password must contain at least one number.");
      return;
    } else if (!/[A-Z]/.test(newPassword)) {
      Alert.alert("Weak password", "Password must contain at least one uppercase letter.");
      return;
    } else if (!/[a-z]/.test(newPassword)) {
      Alert.alert("Weak password", "Password must contain at least one lowercase letter.");
      return;
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      Alert.alert("Weak password", "Password must contain at least one special character.");
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
        <AppCard className="bg-app-surface rounded-2xl p-5 elevation-3">
          <Text className="text-[24px] font-bold text-app-text mb-[6px]">Reset Password</Text>
          <Text className="text-app-muted mb-4">Enter the 6-digit OTP sent to your email and set a new password.</Text>

          <AppInput
            className="rounded-xl border border-app-border bg-app-surface px-3 py-3 text-[16px] text-app-text mb-3"
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <AppInput
            className="rounded-xl border border-app-border bg-app-surface px-3 py-3 text-[16px] text-app-text mb-3 text-center text-xl tracking-[8px]"
            placeholder="000000"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
          />

          <AppInput
            className="rounded-xl border border-app-border bg-app-surface px-3 py-3 text-[16px] text-app-text mb-3"
            placeholder="New password"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <AppInput
            className="rounded-xl border border-app-border bg-app-surface px-3 py-3 text-[16px] text-app-text mb-3"
            placeholder="Confirm new password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <AppButton
            title="Reset Password"
            loading={loading}
            onPress={handleReset}
            className={`bg-blue-600 rounded-[10px] min-h-[48px] items-center justify-center${loading ? " opacity-75" : ""}`}
            textClassName="text-white text-[15px] font-bold"
          />

          <AppButton
            title="Get one time password"
            variant="ghost"
            onPress={() => router.replace("/auth/forgot-password")}
            className="bg-blue-600 rounded-[10px] min-h-[48px] items-center justify-center"
            textClassName="text-blue-600 font-semibold"
          />

          {message ? <Text className="mt-3 text-app-muted">{message}</Text> : null}

          <AppButton
            title="Back to login"
            variant="ghost"
            onPress={() => router.replace("/auth/login")}
            className="mt-[14px] items-center"
            textClassName="text-blue-600 font-semibold"
          />
        </AppCard>
      </ScrollView>
    </SafeAreaView>
  );
}
