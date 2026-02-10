import { View, Text, StyleSheet } from "react-native";

export default function ProfileCard({ user }: { user: any }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>👤 Profile</Text>
      <Text>Name: {user.name}</Text>
      <Text>Email: {user.email}</Text>
      <Text>Role: {user.role}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    marginTop: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
