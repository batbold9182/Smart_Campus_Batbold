import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "expo-router";

type UserPayload = {
  id: string;
  role: "admin" | "faculty" | "student";
  exp: number;
};

export default function useAuthGuard(requiredRole?: UserPayload["role"]) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserPayload | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        if (!token) {
          setLoading(false);
          router.replace("/login");
          return;
        }

        const decoded = jwtDecode<UserPayload>(token);

        // token expired
        if (decoded.exp * 1000 < Date.now()) {
          await AsyncStorage.removeItem("token");
          setLoading(false);
          router.replace("/login");
          return;
        }

        // role mismatch
        if (requiredRole && decoded.role !== requiredRole) {
          setLoading(false);
          router.replace("/login");
          return;
        }

        setUser(decoded);
        setLoading(false);
      } catch (err) {
        await AsyncStorage.removeItem("token");
        console.error("Auth guard error:", err);
        setLoading(false);
        router.replace("/login");
      }
    };

    checkAuth();
  }, [requiredRole, router]);

  return { loading, user };
}
