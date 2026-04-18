import { useEffect, useState } from "react";
import logger from "../utils/logger";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "expo-router";
import { clearToken, getToken } from "../services/tokenStorage";

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
        const token = await getToken();

        if (!token) {
          router.replace("/auth/login");
          return;
        }

        const decoded = jwtDecode<UserPayload>(token);

        // token expired
        if (decoded.exp * 1000 < Date.now()) {
          await clearToken();
          router.replace("/auth/login");
          return;
        }

        // role mismatch
        if (requiredRole && decoded.role !== requiredRole) {
          router.replace("/auth/login");
          return;
        }

        setUser(decoded);
        setLoading(false);
      } catch (err) {
        await clearToken();
        logger.error("Auth guard error:", err);
        router.replace("/auth/login");
      }
    };

    checkAuth();
  }, [requiredRole, router]);

  return { loading, user };
}
