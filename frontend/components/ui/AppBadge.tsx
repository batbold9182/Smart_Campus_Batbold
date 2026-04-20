import { View, Text } from "react-native";

type ColorScheme = "success" | "error" | "warning" | "info" | "neutral";
type BadgeSize = "sm" | "md";

interface AppBadgeProps {
  label: string;
  color?: ColorScheme;
  size?: BadgeSize;
  className?: string;
  textClassName?: string;
}

const colorClasses: Record<ColorScheme, { bg: string; text: string }> = {
  success: { bg: "bg-app-success-bg", text: "text-app-success" },
  error:   { bg: "bg-app-error-bg",   text: "text-app-error" },
  warning: { bg: "bg-app-warning-bg", text: "text-app-warning" },
  info:    { bg: "bg-app-primary-bg", text: "text-app-primary" },
  neutral: { bg: "bg-app-bg-muted",   text: "text-app-muted" },
};

const sizeClasses: Record<BadgeSize, { container: string; text: string }> = {
  sm: { container: "rounded-full px-2 py-0.5", text: "text-app-xs font-semibold" },
  md: { container: "rounded-full px-3 py-1",   text: "text-app-sm font-semibold" },
};

export function AppBadge({ label, color = "neutral", size = "md", className, textClassName }: AppBadgeProps) {
  const c = colorClasses[color];
  const s = sizeClasses[size];
  return (
    <View className={className ?? `${s.container} ${c.bg}`}>
      <Text className={textClassName ?? `${s.text} ${c.text}`}>{label}</Text>
    </View>
  );
}
