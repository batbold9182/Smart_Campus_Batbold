import { Stack } from "expo-router";
import useAuthGuard from "../../hooks/useAuthGuard";

export default function FacultyLayout() {
  const { loading } = useAuthGuard("faculty");

  if (loading) return null;


  return <Stack  screenOptions={{headerShown:false}}/>;
}
