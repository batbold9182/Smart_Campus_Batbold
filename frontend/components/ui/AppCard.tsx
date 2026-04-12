import { View, type ViewProps } from "react-native";

type Variant = "elevated" | "bordered" | "flat";

interface AppCardProps extends ViewProps {
  variant?: Variant;
  /** Override container className */
  className?: string;
}

const variantClass: Record<Variant, string> = {
  elevated: "rounded-xl bg-app-surface p-4 shadow-card",
  bordered: "rounded-xl border border-app-border bg-app-surface p-4",
  flat: "rounded-xl bg-app-surface p-4",
};

export function AppCard({ variant = "elevated", className, children, ...rest }: AppCardProps) {
  return (
    <View className={className ?? variantClass[variant]} {...rest}>
      {children}
    </View>
  );
}
