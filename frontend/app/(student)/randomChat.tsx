import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";

export default function RandomChat() {
  const router = useRouter();

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ marginBottom: 12 }}>
        feature coming soon
      </Text>
      <Button title="Back to dashboard" onPress={() => router.push("/(student)/dashboard")} />
    </View>
  );
}
