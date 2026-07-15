import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
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
      setMessage("Email, OTP, new password, and confirm password are required.");
      return;
    }

    if (cleanOtp.length !== 6) {
      setMessage("Please enter the 6-digit OTP.");
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
          <Text className="text-app-xl font-bold text-app-text mb-[6px]">Reset Password</Text>
          <Text className="text-app-muted mb-5">Enter the 6-digit OTP sent to your email and set a new password.</Text>

          <View className="mb-3">
            <AppInput
              label="Email"
              placeholder="Enter your email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              maxLength={255}
            />
          </View>

          <View className="mb-3">
            <AppInput
              label="One-Time Password"
              placeholder="6-digit OTP"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
            />
          </View>

          <View className="mb-3">
            <AppInput
              label="New Password"
              placeholder="Min. 9 chars, upper, number, symbol"
              secureTextEntry
              value={newPassword}
              error={errors.password}
              onChangeText={(v) => { setNewPassword(v); if (errors.password) setErrors((e) => ({ ...e, password: undefined })); }}
              maxLength={128}
            />
          </View>

          <View className="mb-4">
            <AppInput
              label="Confirm Password"
              placeholder="Re-enter new password"
              secureTextEntry
              value={confirmPassword}
              error={errors.confirm}
              onChangeText={(v) => { setConfirmPassword(v); if (errors.confirm) setErrors((e) => ({ ...e, confirm: undefined })); }}
              maxLength={128}
            />
          </View>

          <AppButton
            title="Reset Password"
            loading={loading}
            onPress={handleReset}
          />

          <AppButton
            title="Get one time password"
            variant="ghost"
            onPress={() => router.replace("/auth/forgot-password")}
          />

          {message ? <Text className="mt-3 text-app-muted">{message}</Text> : null}

          <AppButton
            title="Back to login"
            variant="ghost"
            onPress={() => router.replace("/auth/login")}
          />
        </AppCard>
      </ScrollView>
    </SafeAreaView>
  );
}
