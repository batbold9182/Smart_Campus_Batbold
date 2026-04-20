import { useState, useEffect } from "react";
import logger from "../../utils/logger";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { login } from "../../services/authService";
import { router, useLocalSearchParams } from "expo-router";
import { setToken } from "../../services/tokenStorage";
import { haptic } from "../../utils/haptics";
import { AppButton, AppInput, AppCard } from "../../components/ui";
import { Asset } from "expo-asset";
Asset.loadAsync([
  require("../../assets/images/Logo_VIZJA.webp"),
]);


export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const { reason } = useLocalSearchParams<{ reason?: string }>();
  const [email, setEmail] = useState("");
  const logoSize = Math.max(68, Math.min(96, Math.round(width * 0.12)));

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (reason === "expired") {
      setMessage("Your session has expired. Please log in again.");
    }
  }, [reason]);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    const nextEmailError = trimmedEmail ? "" : "Email is required.";
    const nextPasswordError = password ? "" : "Password is required.";
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    if (nextEmailError || nextPasswordError) {
      haptic.error();
      setMessage("Please fix the errors below.");
      return;
    }

    setIsLoading(true);
    setMessage("");
    try {
      const data = await login(trimmedEmail, password);
      if (data?.user?.isActive === false) {
        haptic.error();
        setMessage("Your account is deactivated. Please contact admin.");
        return;
      }
      if (!data?.token || !data?.user?.role) {
        haptic.error();
        setMessage("Login failed. Please try again.");
        return;
      }

      haptic.success();
      await setToken(data.token);

      if (data.user.role === "admin") {
        router.replace("/admin/dashboard");
      } else if (data.user.role === "faculty") {
        router.replace("/faculty/dashboard");
      } else {
        router.replace("/student/dashboard");
      }
    } catch (err: any) {
      haptic.error();
      const status = err?.response?.status;
      const serverMessage = err?.response?.data?.message;
      if (status === 403 && serverMessage) {
        setMessage(serverMessage);
      } else if (status === 404) {
        setMessage("User does not exist.");
      } else if (status === 401) {
        setMessage("Wrong password. Please try again.");
      } else if (!err?.response) {
        setMessage("Network error. Check your connection and try again.");
      } else {
        setMessage("Login failed");
      }
      logger.error(err?.response?.data || err?.message || err);
    } finally {
      setIsLoading(false);
    }
};


  return (
    <SafeAreaView className="flex-1 bg-app-bg">
      <KeyboardAvoidingView
        className="flex-1 px-5 relative overflow-hidden"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Decorative gradient orbs */}
        <View className="absolute top-[-120px] right-[-100px] w-[260px] h-[260px] rounded-full bg-app-primary-bg opacity-60" />
        <View className="absolute bottom-[-130px] left-[-120px] w-[280px] h-[280px] rounded-full bg-app-primary-bg opacity-40" />

        <ScrollView
          contentContainerClassName="flex-grow justify-center py-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AppCard className="bg-app-surface rounded-[18px] p-5 shadow-card elevation-4">
            <Image
              source={(require("../../assets/images/Logo_VIZJA.webp"))}
              style={{ width: logoSize, height: logoSize, alignSelf: "center", marginBottom: 8 }}
              resizeMode="contain"
            />
            <Text className="text-app-sm font-bold text-app-primary mb-[6px] text-center">Vizja Smart Campus</Text>
            <Text className="text-app-2xl font-bold text-app-text text-center">Welcome Back</Text>
            <Text className="mt-1 mb-[18px] text-app-muted text-center">Sign in to continue to your dashboard</Text>

            <View className="mb-3">
              <AppInput
                label="Email"
                placeholder="Enter your email"
                value={email}
                error={emailError}
                onChangeText={(value) => {
                  setEmail(value);
                  if (emailError) setEmailError("");
                  if (message) setMessage("");
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                textContentType="emailAddress"
                autoComplete="email"
                maxLength={255}
              />
            </View>

            <View className="mb-2">
              <AppInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                error={passwordError}
                onChangeText={(value) => {
                  setPassword(value);
                  if (passwordError) setPasswordError("");
                  if (message) setMessage("");
                }}
                secureTextEntry
                autoCorrect={false}
                textContentType="password"
                autoComplete="password"
                maxLength={128}
              />
            </View>

            <TouchableOpacity
              className="self-end mb-3"
              onPress={() => router.push("/auth/reset-password")}
              disabled={isLoading}
            >
              <Text className="text-app-primary font-semibold">Reset password?</Text>
            </TouchableOpacity>

            <AppButton
              title="Login"
              loading={isLoading}
              onPress={handleLogin}
            />

            {message ? <Text className="mt-[14px] text-center text-app-error">{message}</Text> : null}

            <AppButton
              title="Don't have an account? Register"
              variant="ghost"
              onPress={() => router.push("/auth/register")}
              disabled={isLoading}
            />
          </AppCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
