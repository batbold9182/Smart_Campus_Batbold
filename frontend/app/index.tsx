import { useEffect } from "react";
import { Text } from "react-native";
import { useRouter } from "expo-router";
import { getToken } from "../services/tokenStorage";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getToken();

      if (token) {
        router.replace("/profile");
      } else {
        router.replace("/login");
      }
    };  

    checkAuth();
  }, [router]);

  return <Text>Loading...</Text>;
}
