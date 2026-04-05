import api from "../config/clientAPI";
import { clearToken } from "./tokenStorage";
export const login = async (email: string, password: string) => {
  const response = await api.post("/api/auth/login", {
    email,
    password,
  });
  return response.data;
};
export const logout = async () => {
  await clearToken();
}


export const register = async (
  name: string,
  email: string,
  password: string
) => {
  const response = await api.post("/api/auth/register", {
    name,
    email,
    password,
  });
  return response.data;
};

export const forgotPassword = async (email: string) => {
  const response = await api.post("/api/auth/forgot-password", { email });
  return response.data as {
    message: string;
    otp?: string;
    expiresInMinutes?: number;
  };
};

export const resetPassword = async (email: string, otp: string, newPassword: string) => {
  const response = await api.post("/api/auth/reset-password", {
    email,
    otp,
    newPassword,
  });
  return response.data as { message: string };
};
