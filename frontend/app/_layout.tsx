import { Stack } from "expo-router";
import useAuthGuard from "../hooks/useAuthGuard";

export default function RootLayout() {
  const { loading } = useAuthGuard();
  if (loading) return null;

  return <Stack  screenOptions={{headerShown:false}}/>;

}
