import { useEffect, useRef } from "react";
import { AppState, AppStateStatus, Text } from "react-native";
import { useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { clearToken, getToken } from "../services/tokenStorage";

type UserPayload = {
  role: "admin" | "faculty" | "student";
  exp: number;
};

async function resolveTokenRoute(): Promise<
  | "/auth/login"
  | "/admin/dashboard"
  | "/faculty/dashboard"
  | "/student/dashboard"
> {
  const token = await getToken();
  if (!token) return "/auth/login";
  try {
    const decoded = jwtDecode<UserPayload>(token);
    if (decoded.exp * 1000 < Date.now()) {
      await clearToken();
      return "/auth/login";
    }
    if (decoded.role === "admin") return "/admin/dashboard";
    if (decoded.role === "faculty") return "/faculty/dashboard";
    return "/student/dashboard";
  } catch {
    await clearToken();
    return "/auth/login";
  }
}

export default function Index() {
  const router = useRouter();
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    // Cold-start check
    resolveTokenRoute().then((route) => router.replace(route));

    // Foreground-resume check: re-validate token each time app becomes active
    const subscription = AppState.addEventListener(
      "change",
      async (nextState) => {
        if (appState.current !== "active" && nextState === "active") {
          const route = await resolveTokenRoute();
          if (route === "/auth/login") {
            router.replace("/auth/login");
          }
        }
        appState.current = nextState;
      }
    );

    return () => subscription.remove();
  }, [router]);

  return <Text>Loading...</Text>;
}
