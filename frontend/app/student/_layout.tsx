import { Stack } from "expo-router";
import useAuthGuard from "../../hooks/useAuthGuard";

export default function StudentLayout() {
  const { loading, user } = useAuthGuard("student");

  if (loading || !user) return null;

  return <Stack  screenOptions={{headerShown:false}}/>;
}
