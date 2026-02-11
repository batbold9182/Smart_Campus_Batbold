import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { createFaculty } from "../../services/adminService";
import { useRouter } from "expo-router";

export default function CreateFacultyScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleCreate = async () => {
    try {
      await createFaculty(name, email, password);
      setMessage("✅ Faculty created");
      setName("");
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setMessage("❌ Failed to create faculty");
      console.log(err.response?.data || err.message);
    }
  };

  return (
    <View style={styles.container}>

      <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />

      <Button title="Create Faculty" onPress={handleCreate} />
      <Button title="Back to Dashboard" onPress={() => router.push("../dashboard")} />
      {message ? <Text>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 22, marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, padding: 10, marginBottom: 12, borderRadius: 6 },
  card: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
});
