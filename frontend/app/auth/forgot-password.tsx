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
import { router } from "expo-router";
import { forgotPassword } from "../../services/authService";
import { rootStyles } from "../../styles/rootStyles";

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
        <View className="bg-app-surface rounded-2xl p-5 elevation-3">
          <Text className="text-[24px] font-bold text-app-text mb-[6px]">Forgot Password</Text>
          <Text className="text-app-muted mb-4">Enter your account email to receive a 6-digit OTP.</Text>

          <TextInput
            className={rootStyles.input + " mb-3"}
            placeholder="Email"
            placeholderTextColor="#6b7280"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <TouchableOpacity
            className={`bg-blue-600 rounded-[10px] min-h-[48px] items-center justify-center${loading ? " opacity-75" : ""}`}
            onPress={handleRequestReset}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-[15px] font-bold">Send OTP</Text>}
          </TouchableOpacity>

          {message ? <Text className="mt-3 text-app-muted">{message}</Text> : null}

          {devOtp ? (
            <View className="mt-[14px] border border-app-border rounded-[10px] p-3 bg-[#f8fafc]">
              <Text className="font-bold text-app-text mb-[6px]">Development OTP</Text>
              <Text selectable className="text-[#374151] text-2xl tracking-[8px] text-center mb-[10px]">{devOtp}</Text>
              <TouchableOpacity
                className="items-center justify-center rounded-lg border border-blue-600 py-[10px]"
                onPress={() => router.push({ pathname: "/auth/reset-password", params: { email: email.trim() } })}
              >
                <Text className="text-blue-600 font-bold">Continue to Reset Password</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <TouchableOpacity className="mt-[14px] items-center" onPress={() => router.replace("/auth/reset-password")}>
            <Text className="text-blue-600 font-semibold">Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
