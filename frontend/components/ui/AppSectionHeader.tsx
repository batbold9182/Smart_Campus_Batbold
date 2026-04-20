import { View, Text, TouchableOpacity } from "react-native";

interface AppSectionHeaderProps {
  title: string;
  action?: { label: string; onPress: () => void };
}

export function AppSectionHeader({ title, action }: AppSectionHeaderProps) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <Text className="text-app-lg font-bold text-app-text">{title}</Text>
      {action && (
        <TouchableOpacity onPress={action.onPress} hitSlop={8}>
          <Text className="text-app-sm font-semibold text-app-primary">{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
