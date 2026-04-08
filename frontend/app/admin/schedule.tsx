import { View, Text } from "react-native";
export default function AdminSchedule() {
  return (
    <View className="flex-1 bg-app-bg p-5">
      <View className="rounded-xl bg-app-surface p-4 shadow">
        <Text className="mb-2 text-2xl font-bold text-app-text">Admin Schedule Management</Text>
        <Text className="text-app-muted">Here you can manage schedules and assign them to students.</Text>
      </View>
    </View>
  );
}
