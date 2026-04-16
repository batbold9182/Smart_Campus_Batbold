import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const TOKEN_KEY = "token";

// expo-secure-store is not available on web; fall back to AsyncStorage there.
const isWeb = Platform.OS === "web";

export const getToken = async (): Promise<string | null> => {
  if (isWeb) return AsyncStorage.getItem(TOKEN_KEY);
  return SecureStore.getItemAsync(TOKEN_KEY);
};

export const setToken = async (token: string): Promise<void> => {
  if (isWeb) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
};

export const clearToken = async (): Promise<void> => {
  if (isWeb) {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
};
