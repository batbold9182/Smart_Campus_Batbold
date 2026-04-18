import axios from "axios";
import { router } from "expo-router";
import { getToken, clearToken } from "../services/tokenStorage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 ATTACH TOKEN AUTOMATICALLY
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();

    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      if (config.headers && "Content-Type" in config.headers) {
        delete config.headers["Content-Type"];
      }
      if (config.headers && "content-type" in config.headers) {
        delete config.headers["content-type"];
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 📦 UNWRAP STANDARDISED ENVELOPE { success, message, data } → data
// Routes return { success, message, data }; this interceptor makes service
// files receive the payload directly so they need no changes.
api.interceptors.response.use(
  (response) => {
    if (
      response.data !== null &&
      typeof response.data === "object" &&
      "success" in response.data &&
      "data" in response.data
    ) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error) => {
    const status: number | undefined = error.response?.status;
    const isLoginRequest = error.config?.url?.includes("/auth/login");

    if (status === 401 && !isLoginRequest) {
      await clearToken();
      router.replace("/auth/login?reason=expired");
    }

    // Attach a human-readable message so components can use error.friendlyMessage
    if (status === 403) {
      error.friendlyMessage = "You don't have permission to do that.";
    } else if (status === 404) {
      error.friendlyMessage = "The requested resource was not found.";
    } else if (status !== undefined && status >= 500) {
      error.friendlyMessage = "Server error — please try again later.";
    }

    return Promise.reject(error);
  }
);

export default api;
