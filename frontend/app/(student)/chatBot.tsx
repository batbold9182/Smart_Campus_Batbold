import { View, Text } from "react-native";
export default function ChatBot() {
  return (
    <View className="p-4">
      <Text className="text-2xl font-bold mb-4">Chat Bot Management</Text>
      <Text className="text-gray-600">
        Only will answer FAQ questions, and will not have a learning function. It will be used to provide quick answers to common questions from students and staff.
        This is a placeholder for the Chat Bot management interface.
        </Text>
    </View>
  );
}
