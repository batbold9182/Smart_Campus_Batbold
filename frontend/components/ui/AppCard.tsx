import React from "react";
import { View, Pressable, type ViewProps, type PressableProps } from "react-native";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "../../contexts/ThemeContext";
import { motion, radius } from "../../styles/tokens";

type Variant = "elevated" | "bordered" | "flat" | "glass" | "interactive";

interface AppCardProps extends ViewProps {
  variant?: Variant;
  className?: string;
  /** Only used when variant="interactive" */
  onPress?: PressableProps["onPress"];
}

const AnimatedView = Reanimated.createAnimatedComponent(View);

export function AppCard({ variant = "elevated", className, children, onPress, ...rest }: AppCardProps) {
  const { t } = useTheme();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: motion.fast });
  };
  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: motion.fast });
  };

  // Glass and interactive need theme-aware inline styles
  if (variant === "glass") {
    return (
      <View
        style={{
          backgroundColor: t.glassLight,
          borderWidth: 1,
          borderColor: t.glassBorder,
          borderRadius: radius.xl,
          padding: 16,
        }}
        {...rest}
      >
        {children}
      </View>
    );
  }

  if (variant === "interactive") {
    return (
      <AnimatedView style={[animStyle, { borderRadius: radius.xl, overflow: "hidden" }]}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
          className={className ?? "rounded-2xl bg-app-surface p-4 shadow-card-md"}
          {...(rest as any)}
        >
          {children}
        </Pressable>
      </AnimatedView>
    );
  }

  const variantClass: Record<Exclude<Variant, "glass" | "interactive">, string> = {
    elevated: "rounded-2xl bg-app-surface p-4 shadow-card-md border border-app-border-light",
    bordered: "rounded-2xl border border-app-border bg-app-surface p-4",
    flat:     "rounded-2xl bg-app-surface p-4",
  };

  return (
    <View className={className ?? variantClass[variant as keyof typeof variantClass]} {...rest}>
      {children}
    </View>
  );
}
