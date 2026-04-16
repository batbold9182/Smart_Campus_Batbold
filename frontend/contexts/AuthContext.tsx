import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import { getToken, clearToken } from "../services/tokenStorage";

export type UserPayload = {
  id: string;
  role: "admin" | "faculty" | "student";
  exp: number;
};

type AuthContextValue = {
  user: UserPayload | null;
  /** Call after a successful login to refresh the decoded user without reloading. */
  refreshUser: () => Promise<void>;
  /** Call on logout to clear the cached user. */
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  refreshUser: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserPayload | null>(null);

  const loadUser = async () => {
    const token = await getToken();
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const decoded = jwtDecode<UserPayload>(token);
      if (decoded.exp * 1000 < Date.now()) {
        await clearToken();
        setUser(null);
      } else {
        setUser(decoded);
      }
    } catch {
      await clearToken();
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const refreshUser = async () => {
    await loadUser();
  };

  const signOut = async () => {
    await clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, refreshUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
