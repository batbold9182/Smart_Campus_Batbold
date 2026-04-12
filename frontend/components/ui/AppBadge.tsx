import { View, Text } from "react-native";

type ColorScheme = "success" | "error" | "warning" | "info" | "neutral";

interface AppBadgeProps {
  label: string;
  color?: ColorScheme;
  /** Override container className */
  className?: string;
  /** Override text className */
  textClassName?: string;
}

const colorClasses: Record<ColorScheme, { bg: string; text: string }> = {
  success: { bg: "bg-app-success-bg", text: "text-app-success" },
  error: { bg: "bg-app-error-bg", text: "text-app-error" },
  warning: { bg: "bg-app-warning-bg", text: "text-app-warning" },
  info: { bg: "bg-app-primary-bg", text: "text-app-primary" },
  neutral: { bg: "bg-app-bg-muted", text: "text-app-muted" },
};

export function AppBadge({ label, color = "neutral", className, textClassName }: AppBadgeProps) {
  const c = colorClasses[color];
  return (
    <View className={className ?? `rounded-full px-3 py-1 ${c.bg}`}>
      <Text className={textClassName ?? `text-[12px] font-semibold ${c.text}`}>{label}</Text>
    </View>
  );
}
