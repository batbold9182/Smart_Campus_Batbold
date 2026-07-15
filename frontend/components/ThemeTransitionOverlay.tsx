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
import { palette, motion } from "../styles/tokens";

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
      bg.value = prevDark.current ? palette.teal950 : palette.appBg;
      prevDark.current = isDark;

      fade.value = withSequence(
        withTiming(1, { duration: 0 }),
        withTiming(0, { duration: motion.slow, easing: Easing.out(Easing.cubic) }),
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
