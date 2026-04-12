import { useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "../contexts/ThemeContext";

const LIGHT_BG = "#f5f7fb";
const DARK_BG = "#0d0221";

/**
 * Full-screen overlay that briefly covers the screen with the OLD theme's
 * background colour, then fades out to reveal the NEW theme.
 * Place after the main content in the render tree so it sits on top.
 */
export function ThemeTransitionOverlay() {
  const { isDark } = useTheme();
  const fade = useSharedValue(0);
  const bg = useSharedValue("transparent");
  const prevDark = useRef(isDark);

  useEffect(() => {
    if (isDark !== prevDark.current) {
      // Set overlay to the OLD theme background and flash it
      bg.value = prevDark.current ? DARK_BG : LIGHT_BG;
      prevDark.current = isDark;

      fade.value = withSequence(
        withTiming(1, { duration: 0 }),
        withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }),
      );
    }
  }, [isDark, fade, bg]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    backgroundColor: bg.value as string,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, animStyle]}
    />
  );
}
