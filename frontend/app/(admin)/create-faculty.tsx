import { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
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
    <View className="flex-1 bg-[#f5f7fb] p-5">
      <View className="rounded-xl bg-white p-4 shadow">
        <Text className="mb-4 text-xl font-bold text-[#111827]">Create Faculty</Text>

        <TextInput placeholder="Name" value={name} onChangeText={setName} className="mb-3 rounded-lg border border-[#d1d5db] bg-white px-3 py-3" />
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} className="mb-3 rounded-lg border border-[#d1d5db] bg-white px-3 py-3" />
        <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry className="mb-4 rounded-lg border border-[#d1d5db] bg-white px-3 py-3" />

        <View className="mb-2">
          <Button title="Create Faculty" onPress={handleCreate} />
        </View>
        <Button title="Back to Dashboard" onPress={() => router.push("../dashboard")} />
        {message ? <Text className="mt-3 text-center text-[#374151]">{message}</Text> : null}
      </View>
    </View>
  );
}
