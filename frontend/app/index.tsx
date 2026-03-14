import { useEffect } from "react";
import { Text } from "react-native";
import { useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { clearToken, getToken } from "../services/tokenStorage";

type UserPayload = {
  role: "admin" | "faculty" | "student";
  exp: number;
};

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getToken();

      if (!token) {
        router.replace("/(auth)/login");
        return;
      }

      try {
        const decoded = jwtDecode<UserPayload>(token);

        if (decoded.exp * 1000 < Date.now()) {
          await clearToken();
          router.replace("/(auth)/login");
          return;
        }

        if (decoded.role === "admin") {
          router.replace("/(admin)/dashboard");
        } else if (decoded.role === "faculty") {
          router.replace("/(faculty)/dashboard");
        } else {
          router.replace("/(student)/dashboard");
        }
      } catch {
        await clearToken();
        router.replace("/(auth)/login");
      }
    };  

    checkAuth();
  }, [router]);

  return <Text>Loading...</Text>;
}
