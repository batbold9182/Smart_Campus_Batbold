import React from "react";
import { View, Text, ActivityIndicator, Pressable, type PressableProps } from "react-native";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { haptic } from "../../utils/haptics";
import { useTheme } from "../../contexts/ThemeContext";
import { gradients, motion, palette, radius } from "../../styles/tokens";

type Variant = "primary" | "danger" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

export interface AppButtonProps extends Omit<PressableProps, "children"> {
  title?: string;
  children?: React.ReactNode;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  /** Icon rendered to the left of the label */
  icon?: React.ReactNode;
  /** Icon rendered to the right of the label */
  iconRight?: React.ReactNode;
  className?: string;
  textClassName?: string;
}

const sizeStyles: Record<Size, { paddingV: number; paddingH: number; fontSize: number; borderRadius: number }> = {
  sm: { paddingV: 10, paddingH: 12, fontSize: 13, borderRadius: radius.md },
  md: { paddingV: 14, paddingH: 16, fontSize: 15, borderRadius: radius.lg },
  lg: { paddingV: 18, paddingH: 20, fontSize: 17, borderRadius: radius.lg },
};

const AnimatedPressable = Reanimated.createAnimatedComponent(Pressable);

export function AppButton({
  title,
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconRight,
  className,
  textClassName,
  onPress,
  disabled,
  ...rest
}: AppButtonProps) {
  const { isDark } = useTheme();
  const scale = useSharedValue(1);
  const sz = sizeStyles[size];
  const label = title ?? (typeof children === "string" ? children : undefined);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderRadius: sz.borderRadius,
    overflow: "hidden" as const,
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.96, { duration: motion.fast });
  };
  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: motion.fast });
  };

  const isDisabled = loading || !!disabled;

  const innerContent = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
      }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" || variant === "ghost" ? palette.blue600 : palette.white}
        />
      ) : (
        <>
          {icon}
          {label ? (
            <Text
              style={{ fontSize: sz.fontSize, fontWeight: "600" }}
              className={
                textClassName ??
                (variant === "outline"
                  ? "text-app-text"
                  : variant === "ghost"
                  ? "text-app-primary"
                  : "text-white")
              }
            >
              {label}
            </Text>
          ) : (
            children
          )}
          {iconRight}
        </>
      )}
    </View>
  );

  const gradientColors =
    isDisabled
      ? (["#93c5fd", "#a78bfa"] as const)
      : isDark
      ? gradients.primaryDark
      : gradients.primary;

  return (
    <AnimatedPressable
      style={animStyle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={(e) => {
        if (!isDisabled) {
          haptic.light();
          onPress?.(e);
        }
      }}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label ?? "button"}
      {...rest}
    >
      {variant === "primary" ? (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            paddingVertical: sz.paddingV,
            paddingHorizontal: sz.paddingH,
            borderRadius: sz.borderRadius,
          }}
        >
          {innerContent}
        </LinearGradient>
      ) : (
        <View
          className={
            className ??
            (variant === "danger"
              ? "bg-app-danger"
              : variant === "outline"
              ? "border border-app-border bg-app-surface"
              : "bg-transparent")
          }
          style={{
            paddingVertical: sz.paddingV,
            paddingHorizontal: sz.paddingH,
            borderRadius: sz.borderRadius,
            opacity: isDisabled ? 0.5 : 1,
          }}
        >
          {innerContent}
        </View>
      )}
    </AnimatedPressable>
  );
}
