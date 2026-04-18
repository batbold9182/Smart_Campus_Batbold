import { TouchableOpacity, Text, ActivityIndicator, type TouchableOpacityProps } from "react-native";
import { haptic } from "../../utils/haptics";

type Variant = "primary" | "danger" | "outline" | "ghost";

export interface AppButtonProps extends Omit<TouchableOpacityProps, "children"> {
  /** Button label – accepts either `title` prop or a string child */
  title?: string;
  children?: React.ReactNode;
  variant?: Variant;
  loading?: boolean;
  /** Override container className */
  className?: string;
  /** Override text className */
  textClassName?: string;
}

const base = "items-center rounded-xl px-4 py-[14px]";

const variantClass: Record<Variant, { container: string; text: string; loadingContainer: string }> = {
  primary: {
    container: `${base} bg-app-primary`,
    text: "font-semibold text-white",
    loadingContainer: `${base} bg-app-primary-loading`,
  },
  danger: {
    container: `${base} bg-app-danger`,
    text: "font-semibold text-white",
    loadingContainer: `${base} bg-app-error-loading`,
  },
  outline: {
    container: `${base} border border-app-border bg-app-surface`,
    text: "font-semibold text-app-text",
    loadingContainer: `${base} border border-app-border bg-app-bg-muted`,
  },
  ghost: {
    container: `${base} bg-transparent`,
    text: "font-semibold text-app-primary",
    loadingContainer: `${base} bg-transparent`,
  },
};

export function AppButton({
  title,
  children,
  variant = "primary",
  loading = false,
  className,
  textClassName,
  onPress,
  disabled,
  ...rest
}: AppButtonProps) {
  const label = title ?? (typeof children === "string" ? children : undefined);
  const v = variantClass[variant];
  const containerCls = className ?? (loading || disabled ? v.loadingContainer : v.container);
  const textCls = textClassName ?? v.text;

  return (
    <TouchableOpacity
      className={containerCls}
      disabled={loading || disabled}
      onPress={(e) => {
        haptic.light();
        onPress?.(e);
      }}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={label ?? "button"}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" || variant === "ghost" ? "#2563eb" : "#fff"} />
      ) : label ? (
        <Text className={textCls}>{label}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}
