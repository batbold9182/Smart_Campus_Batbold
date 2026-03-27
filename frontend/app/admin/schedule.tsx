import { View, Text } from "react-native";
export default function AdminSchedule() {
  return (
    <View className="flex-1 bg-[#f5f7fb] p-5">
      <View className="rounded-xl bg-white p-4 shadow">
        <Text className="mb-2 text-2xl font-bold text-[#111827]">Admin Schedule Management</Text>
        <Text className="text-[#4b5563]">Here you can manage schedules and assign them to students.</Text>
      </View>
    </View>
  );
}
