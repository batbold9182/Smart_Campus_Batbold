import { Stack } from "expo-router";
import useAuthGuard from "../../hooks/useAuthGuard";

export default function AdminLayout() {
  const { loading } = useAuthGuard("admin");

  if (loading) return null;

  return <Stack  screenOptions={{headerShown:false}}/>;
}
