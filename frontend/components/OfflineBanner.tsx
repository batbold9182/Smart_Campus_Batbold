import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { motion } from "../styles/tokens";

/**
 * Thin red banner shown when the device is offline.
 */
export default function OfflineBanner() {
  const { isOnline } = useNetworkStatus();
  const translateY = useRef(new Animated.Value(-40)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: isOnline ? -40 : 0,
      duration: motion.normal,
      useNativeDriver: true,
    }).start();
  }, [isOnline, translateY]);

  return (
    <Animated.View
      style={{ transform: [{ translateY }] }}
      className="absolute left-0 right-0 top-0 z-50 items-center bg-app-error px-4 py-2"
      pointerEvents="none"
    >
      <View className="flex-row items-center gap-2">
        <Text className="text-app-sm font-semibold text-white">No internet connection</Text>
      </View>
    </Animated.View>
  );
}
