import { Stack } from "expo-router";
import useAuthGuard from "../../hooks/useAuthGuard";

export default function StudentLayout() {
  const { loading } = useAuthGuard("student");

  if (loading) return null;

  return <Stack  screenOptions={{headerShown:false}}/>;
}
