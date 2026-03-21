import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { login } from "../../services/authService";
import { router } from "expo-router";
import { setToken } from "../../services/tokenStorage";
import { rootStyles } from "../../styles/rootStyles";


export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const [email, setEmail] = useState("");
    const logoSize = Math.max(68, Math.min(96, Math.round(width * 0.12)));

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
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
      setMessage("❌ Please fix the errors below.");
      return;
    }

    setIsLoading(true);
    setMessage("");
    try {
      const data = await login(trimmedEmail, password);
      if (data?.user?.isActive === false) {
        setMessage("❌ Your account is deactivated. Please contact admin.");
        return;
      }
      if (!data?.token || !data?.user?.role) {
        setMessage("❌ Login failed. Please try again.");
        return;
      }

      await setToken(data.token);

      if (data.user.role === "admin") {
        router.replace("/(admin)/dashboard");
      } else if (data.user.role === "faculty") {
        router.replace("/(faculty)/dashboard");
      } else {
        router.replace("/(student)/dashboard");
      }
    } catch (err: any) {
      const status = err?.response?.status;
      const serverMessage = err?.response?.data?.message;
      if (status === 403 && serverMessage) {
        setMessage(`❌ ${serverMessage}`);
      } else if (status === 404) {
        setMessage("❌ User does not exist.");
      } else if (status === 401) {
        setMessage("❌ Wrong password. Please try again.");
      } else if (!err?.response) {
        setMessage("❌ Network error. Check your connection and try again.");
      } else {
        setMessage("❌ Login failed");
      }
      console.error(err?.response?.data || err?.message || err);
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
        <View className="absolute top-[-120px] right-[-100px] w-[260px] h-[260px] rounded-full bg-[#c7dcff]" />
        <View className="absolute bottom-[-130px] left-[-120px] w-[280px] h-[280px] rounded-full bg-[#d9e8ff]" />

        <ScrollView
          contentContainerClassName="flex-grow justify-center py-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="bg-app-surface rounded-[18px] p-5 shadow-card elevation-4">
            <Image
              source={require("../../assets/images/Logo_VIZJA.png")}
              style={{ width: logoSize, height: logoSize, alignSelf: "center", marginBottom: 8 }}
              resizeMode="contain"
            />
            <Text className="text-[14px] font-bold text-blue-600 mb-[6px] text-center">Vizja Smart Campus</Text>
            <Text className="text-[28px] font-bold text-app-text text-center">Welcome Back</Text>
            <Text className="mt-1 mb-[18px] text-app-muted text-center">Sign in to continue to your dashboard</Text>

            <TextInput
              placeholder="Email"
              placeholderTextColor="#6b7280"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (emailError) {
                  setEmailError("");
                }
                if (message) {
                  setMessage("");
                }
              }}
              className={rootStyles.input + " mb-3"}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              textContentType="emailAddress"
              autoComplete="email"
            />
            {emailError ? <Text className="text-[#B00020] -mt-1.5 mb-[10px]">{emailError}</Text> : null}

            <TextInput
              placeholder="Password"
              placeholderTextColor="#6b7280"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                if (passwordError) {
                  setPasswordError("");
                }
                if (message) {
                  setMessage("");
                }
              }}
              secureTextEntry
              className={rootStyles.input + " mb-3"}
              autoCorrect={false}
              textContentType="password"
              autoComplete="password"
            />
            {passwordError ? <Text className="text-[#B00020] -mt-1.5 mb-[10px]">{passwordError}</Text> : null}

            <TouchableOpacity
              className="self-end mb-2"
              onPress={() => router.push("/(auth)/forgot-password")}
              disabled={isLoading}
            >
              <Text className="text-blue-600 font-semibold">Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`mt-[6px] bg-blue-600 rounded-[10px] items-center justify-center min-h-[48px]${isLoading ? " opacity-70" : ""}`}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white text-[16px] font-bold">Login</Text>
              )}
            </TouchableOpacity>

            {message ? <Text className="mt-[14px] text-center text-[#b91c1c]">{message}</Text> : null}

            <TouchableOpacity
              className="mt-3 items-center"
              onPress={() => router.push("/(auth)/register")}
              disabled={isLoading}
            >
              <Text className="text-blue-600 font-semibold">Don&apos;t have an account? Register</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

