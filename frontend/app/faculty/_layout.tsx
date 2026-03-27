import { Stack } from "expo-router";
import useAuthGuard from "../../hooks/useAuthGuard";

export default function FacultyLayout() {
  const { loading, user } = useAuthGuard("faculty");

  if (loading || !user) return null;


  return <Stack  screenOptions={{headerShown:false}}/>;
}
