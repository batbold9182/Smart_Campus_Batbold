import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function useAuthGuard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        router.replace("/login");
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  return loading;
}
