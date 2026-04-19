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
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});

  const handleReset = async () => {
    const cleanOtp = otp.trim();
    const newErrors: { password?: string; confirm?: string } = {};

    if (newPassword.length < 9) {
      newErrors.password = "Password must be at least 9 characters.";
    } else if (newPassword.length > 64) {
      newErrors.password = "Password must be no more than 64 characters.";
    } else if (!/\d/.test(newPassword)) {
      newErrors.password = "Password must contain at least one number.";
    } else if (!/[A-Z]/.test(newPassword)) {
      newErrors.password = "Password must contain at least one uppercase letter.";
    } else if (!/[a-z]/.test(newPassword)) {
      newErrors.password = "Password must contain at least one lowercase letter.";
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      newErrors.password = "Password must contain at least one special character.";
    }

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      newErrors.confirm = "Passwords do not match.";
    } else if (!confirmPassword) {
      newErrors.confirm = "Please confirm your password.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    if (!email || !cleanOtp || !newPassword || !confirmPassword) {
      Alert.alert("Missing fields", "Email, OTP, new password, and confirm password are required.");
      return;
    }

    if (cleanOtp.length !== 6) {
      Alert.alert("Invalid OTP", "Please enter the 6-digit OTP.");
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
            maxLength={255}
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
            className="rounded-xl border border-app-border bg-app-surface px-3 py-3 text-[16px] text-app-text mb-1"
            placeholder="New password"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            maxLength={128}
          />
          {errors.password ? <Text className="mb-2 text-[12px] text-red-500">{errors.password}</Text> : <View className="mb-3" />}

          <AppInput
            className="rounded-xl border border-app-border bg-app-surface px-3 py-3 text-[16px] text-app-text mb-1"
            placeholder="Confirm new password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            maxLength={128}
          />
          {errors.confirm ? <Text className="mb-2 text-[12px] text-red-500">{errors.confirm}</Text> : <View className="mb-3" />}

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
            className="mt-2 items-center justify-center"
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
