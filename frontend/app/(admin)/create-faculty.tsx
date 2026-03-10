import { useState } from "react";
import { View, Text, TextInput, Button, TouchableOpacity } from "react-native";
import { createFaculty } from "../../services/adminService";
import { useRouter } from "expo-router";

export default function CreateFacultyScreen() {
  const [selectedRole, setSelectedRole] = useState<"faculty" | "student">("faculty");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [school, setSchool] = useState("");
  const [department, setDepartment] = useState("");
  const [facultyTitle, setFacultyTitle] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleCreate = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setMessage("❌ Please fill in all fields");
      return;
    }

    if (selectedRole === "faculty" && (!school.trim() || !department.trim() || !facultyTitle.trim())) {
      setMessage("❌ School, department and title are required for faculty");
      return;
    }

    try {
      await createFaculty(name.trim(), email.trim(), password, selectedRole, {
        school: selectedRole === "faculty" ? school.trim() : undefined,
        department: selectedRole === "faculty" ? department.trim() : undefined,
        title: selectedRole === "faculty" ? facultyTitle.trim() : undefined,
      });
      setMessage(`✅ ${selectedRole === "student" ? "Student" : "Faculty"} created`);
      setName("");
      setEmail("");
      setPassword("");
      setSchool("");
      setDepartment("");
      setFacultyTitle("");
    } catch (err: any) {
      const serverMessage = err?.response?.data?.message;
      setMessage(serverMessage ? `❌ ${serverMessage}` : `❌ Failed to create ${selectedRole === "student" ? "student" : "faculty"}`);
      console.log(err.response?.data || err.message);
    }
  };

  const title = selectedRole === "student" ? "Create Student" : "Create Faculty";
  const submitLabel = selectedRole === "student" ? "Create Student" : "Create Faculty";

  return (
    <View className="flex-1 bg-[#f5f7fb] p-5">
      <View className="rounded-xl bg-white p-4 shadow">
        <Text className="mb-4 text-xl font-bold text-[#111827]">{title}</Text>

        <View className="mb-3 flex-row gap-2">
          <TouchableOpacity
            className={`flex-1 items-center rounded-lg border px-3 py-2 ${
              selectedRole === "faculty"
                ? "border-[#2563eb] bg-[#dbeafe]"
                : "border-[#d1d5db] bg-white"
            }`}
            onPress={() => {
              setSelectedRole("faculty");
              setMessage("");
            }}
          >
            <Text className="font-semibold text-[#111827]">Faculty</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 items-center rounded-lg border px-3 py-2 ${
              selectedRole === "student"
                ? "border-[#2563eb] bg-[#dbeafe]"
                : "border-[#d1d5db] bg-white"
            }`}
            onPress={() => {
              setSelectedRole("student");
              setMessage("");
            }}
          >
            <Text className="font-semibold text-[#111827]">Student</Text>
          </TouchableOpacity>
        </View>

        <TextInput placeholder="Name" value={name} onChangeText={setName} className="mb-3 rounded-lg border border-[#d1d5db] bg-white px-3 py-3" />
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} className="mb-3 rounded-lg border border-[#d1d5db] bg-white px-3 py-3" />
        {selectedRole === "faculty" ? (
          <>
            <TextInput
              placeholder="School / Faculty (e.g. Engineering)"
              value={school}
              onChangeText={setSchool}
              className="mb-3 rounded-lg border border-[#d1d5db] bg-white px-3 py-3"
            />
            <TextInput
              placeholder="Department (e.g. Computer Science)"
              value={department}
              onChangeText={setDepartment}
              className="mb-3 rounded-lg border border-[#d1d5db] bg-white px-3 py-3"
            />
            <TextInput
              placeholder="Title (e.g. Instructor)"
              value={facultyTitle}
              onChangeText={setFacultyTitle}
              className="mb-3 rounded-lg border border-[#d1d5db] bg-white px-3 py-3"
            />
          </>
        ) : null}
        <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry className="mb-4 rounded-lg border border-[#d1d5db] bg-white px-3 py-3" />

        <View className="mb-2">
          <Button title={submitLabel} onPress={handleCreate} />
        </View>
        <Button title="Back to Dashboard" onPress={() => router.push("../dashboard")} />
        {message ? <Text className="mt-3 text-center text-[#374151]">{message}</Text> : null}
      </View>
    </View>
  );
}
