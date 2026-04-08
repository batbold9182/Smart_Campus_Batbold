import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import type { ReactNode } from "react";
import type { ViewStyle, StyleProp } from "react-native";

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  direction?: "up" | "down";
  duration?: number;
  delay?: number;
};

export default function AnimatedScreen({
  children,
  style,
  direction = "up",
  duration = 400,
  delay = 0,
}: Props) {
  const entering =
    direction === "up"
      ? FadeInUp.duration(duration).delay(delay)
      : FadeInDown.duration(duration).delay(delay);

  return (
    <Animated.View entering={entering} style={[{ flex: 1 }, style]}>
      {children}
    </Animated.View>
  );
}
