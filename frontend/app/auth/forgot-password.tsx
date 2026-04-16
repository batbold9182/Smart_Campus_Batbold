import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { forgotPassword } from "../../services/authService";
import { AppButton, AppInput, AppCard } from "../../components/ui";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [devOtp, setDevOtp] = useState("");
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
      setDevOtp("");
      const response = await forgotPassword(cleanEmail);
      setMessage(response.message);

      if (response.otp) {
        setDevOtp(response.otp);
      }
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Failed to request password reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-app-bg">
      <ScrollView contentContainerClassName="flex-grow justify-center p-5" keyboardShouldPersistTaps="handled">
        <AppCard className="bg-app-surface rounded-2xl p-5 elevation-3">
          <Text className="text-[24px] font-bold text-app-text mb-[6px]">Forgot Password</Text>
          <Text className="text-app-muted mb-4">Enter your account email to receive a 6-digit OTP.</Text>

          <AppInput
            className="rounded-xl border border-app-border bg-app-surface px-3 py-3 text-[16px] text-app-text mb-3"
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            maxLength={255}
          />

          <AppButton
            title="Send OTP"
            loading={loading}
            onPress={handleRequestReset}
            className={`bg-blue-600 rounded-[10px] min-h-[48px] items-center justify-center${loading ? " opacity-75" : ""}`}
            textClassName="text-white text-[15px] font-bold"
          />

          {message ? <Text className="mt-3 text-app-muted">{message}</Text> : null}

          {__DEV__ && devOtp ? (
            <View className="mt-[14px] border border-app-border rounded-[10px] p-3 bg-app-bg">
              <Text className="font-bold text-app-text mb-[6px]">Development OTP (dev build only)</Text>
              <Text selectable className="text-app-text-secondary text-2xl tracking-[8px] text-center mb-[10px]">{devOtp}</Text>
              <AppButton
                title="Continue to Reset Password"
                variant="outline"
                onPress={() => router.push({ pathname: "/auth/reset-password", params: { email: email.trim() } })}
                className="items-center justify-center rounded-lg border border-blue-600 py-[10px]"
                textClassName="text-blue-600 font-bold"
              />
            </View>
          ) : null}

          <AppButton
            title="Back"
            variant="ghost"
            onPress={() => router.replace("/auth/reset-password")}
            className="mt-[14px] items-center"
            textClassName="text-blue-600 font-semibold"
          />
        </AppCard>
      </ScrollView>
    </SafeAreaView>
  );
}
