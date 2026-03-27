import { Stack } from "expo-router";
import useAuthGuard from "../../hooks/useAuthGuard";

export default function AdminLayout() {
  const { loading, user } = useAuthGuard("admin");

  if (loading || !user) return null;

  return <Stack  screenOptions={{headerShown:false}}/>;
}
