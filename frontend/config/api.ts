import Constants from "expo-constants";

/**
 * Use:
 * - Android emulator: http://10.0.2.2:5000
 * - iOS simulator: http://localhost:5000
 * - Physical device: your PC IP (e.g. http://192.168.1.10:5000)
 */

const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";


export default API_URL;
