import { View, Text, StyleSheet, Image } from "react-native";

export default function ProfileCard({ user }: { user: any }) {
  const hasCustomProfile =
    typeof user?.profile === "string" &&
    user.profile.trim().length > 0 &&
    user.profile !== "defaultProfile.png";

  return (
    <View style={styles.card}>
      <Text style={styles.title}>👤 Profile</Text>
      <Image
        source={
          hasCustomProfile
            ? { uri: user.profile }
            : require("../assets/images/defaultProfile.png")
        }
        style={styles.avatar}
        resizeMode="cover"
      />
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
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 10,
    alignSelf: "center",
  },
});
