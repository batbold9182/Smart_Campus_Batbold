import axios from "axios";
import { getToken } from "../services/tokenStorage";

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

export default api;
