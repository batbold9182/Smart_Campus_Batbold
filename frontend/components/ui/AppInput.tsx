import { TextInput, type TextInputProps } from "react-native";

interface AppInputProps extends TextInputProps {
  /** Override container className */
  className?: string;
}

const defaultClassName =
  "rounded-xl border border-app-border bg-app-surface px-3 py-3 text-[16px] text-app-text";

export function AppInput({ className, placeholderTextColor, accessibilityLabel, accessibilityHint, placeholder, ...rest }: AppInputProps) {
  return (
    <TextInput
      className={className ?? defaultClassName}
      placeholderTextColor={placeholderTextColor ?? "#9ca3af"}
      placeholder={placeholder}
      accessibilityLabel={accessibilityLabel ?? placeholder}
      accessibilityHint={accessibilityHint}
      {...rest}
    />
  );
}
