import React, { useState } from "react";
import { View, Text, TextInput, type TextInputProps } from "react-native";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "../../contexts/ThemeContext";
import { palette, radius } from "../../styles/tokens";

interface AppInputProps extends TextInputProps {
  className?: string;
  /** Label rendered above the input */
  label?: string;
  /** Error message — switches border to error color and shows text below */
  error?: string;
}

const AnimatedView = Reanimated.createAnimatedComponent(View);

export function AppInput({
  className,
  placeholderTextColor,
  accessibilityLabel,
  accessibilityHint,
  placeholder,
  label,
  error,
  onFocus,
  onBlur,
  ...rest
}: AppInputProps) {
  const { t } = useTheme();
  const [focused, setFocused] = useState(false);
  const translateX = useSharedValue(0);

  // Shake on error change
  React.useEffect(() => {
    if (error) {
      translateX.value = withSequence(
        withTiming(-4, { duration: 50 }),
        withTiming(4,  { duration: 50 }),
        withTiming(-4, { duration: 50 }),
        withTiming(4,  { duration: 50 }),
        withTiming(0,  { duration: 50 }),
      );
    }
  }, [error, translateX]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const borderColor = error ? t.error : focused ? t.inputBorderFocus : t.inputBorder;
  const borderWidth = focused && !error ? 1.5 : 1;

  const inputStyle = className
    ? undefined
    : {
        borderWidth,
        borderColor,
        borderRadius: radius.md,
        backgroundColor: t.surface,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        color: t.text,
      };

  return (
    <AnimatedView style={shakeStyle}>
      {label && (
        <Text
          style={{ fontSize: 13, fontWeight: "500", color: t.muted, marginBottom: 6 }}
        >
          {label}
        </Text>
      )}
      <TextInput
        className={className}
        style={className ? undefined : inputStyle}
        placeholderTextColor={placeholderTextColor ?? palette.gray400}
        placeholder={placeholder}
        accessibilityLabel={accessibilityLabel ?? placeholder}
        accessibilityHint={accessibilityHint}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...rest}
      />
      {error && (
        <Text style={{ fontSize: 11, color: t.error, marginTop: 4 }}>{error}</Text>
      )}
    </AnimatedView>
  );
}
