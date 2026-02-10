import { useEffect, useState } from "react";
import { View, ActivityIndicator , Button } from "react-native";
import { getProfile } from "../../services/userService";
import ProfileCard from "../../components/profileCard";
import useAuthGuard from "../../hooks/useAuthGuard";
import { useRouter } from "expo-router";
export default function StudentProfile() {
  const { loading } = useAuthGuard("student");
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    getProfile().then(setUser);
  }, []);

  if (loading || !user) return <ActivityIndicator />;

  return (
    <View style={{ padding: 20 }}>
      <ProfileCard user={user} />
      <Button title = "Go Back" onPress={() => router.push("../dashboard")} />
    </View>
  );
}
