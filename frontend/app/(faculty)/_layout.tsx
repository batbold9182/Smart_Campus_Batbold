import { Stack, Redirect } from "expo-router";
import useAuthGuard from "../../hooks/useAuthGuard";

export default function FacultyLayout() {
  const { loading, user } = useAuthGuard();

  if (loading) return null;

  if (!user || user.role !== "faculty") {
    return <Redirect href="/login" />;
  }

  return <Stack  screenOptions={{headerShown:false}}/>;
}
