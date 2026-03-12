import { useEffect, useState } from "react";
import { View, Text, TextInput, Button, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { createFaculty, getAcademicOptions } from "../../services/adminService";
import { useRouter } from "expo-router";

type AcademicOptions = Record<string, Record<string, string[]>>;

export default function CreateFacultyScreen() {
  const [selectedRole, setSelectedRole] = useState<"faculty" | "student">("faculty");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [school, setSchool] = useState("");
  const [department, setDepartment] = useState("");
  const [facultyTitle, setFacultyTitle] = useState("");
  const [studentId, setStudentId] = useState("");
  const [program, setProgram] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [message, setMessage] = useState("");
  const [academicOptions, setAcademicOptions] = useState<AcademicOptions>({});
  const router = useRouter();
  const schoolOptions = Object.keys(academicOptions);
  const departmentOptions = school ? Object.keys(academicOptions[school] || {}) : [];
  const programOptions = school && department ? academicOptions[school]?.[department] || [] : [];

  useEffect(() => {
    const loadAcademicOptions = async () => {
      try {
        const data = await getAcademicOptions();
        setAcademicOptions(data || {});
      } catch {
        setMessage("❌ Failed to load academic options. Refresh and try again.");
      }
    };

    loadAcademicOptions();
  }, []);

  const handleCreate = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setMessage("❌ Please fill in all fields");
      return;
    }

    if (selectedRole === "faculty" && (!school.trim() || !department.trim() || !facultyTitle.trim())) {
      setMessage("❌ School, department and title are required for faculty");
      return;
    }

    if (selectedRole === "student" && (!school.trim() || !department.trim() || !program.trim() || !studentId.trim() || !yearLevel.trim())) {
      setMessage("❌ School, department, program, student ID and year level are required for student");
      return;
    }

    const parsedYear = Number(yearLevel);
    if (selectedRole === "student" && (!Number.isInteger(parsedYear) || parsedYear < 1)) {
      setMessage("❌ Year level must be a valid number");
      return;
    }

    try {
      await createFaculty(name.trim(), email.trim(), password, selectedRole, {
        profile: "defaultProfile.png",
        school: school.trim() || undefined,
        department: department.trim() || undefined,
        title: selectedRole === "faculty" ? facultyTitle.trim() : undefined,
        studentId: selectedRole === "student" ? studentId.trim() : undefined,
        program: selectedRole === "student" ? program.trim() : undefined,
        yearLevel: selectedRole === "student" ? parsedYear : undefined,
      });
      setMessage(`✅ ${selectedRole === "student" ? "Student" : "Faculty"} created`);
      setName("");
      setEmail("");
      setPassword("");
      setSchool("");
      setDepartment("");
      setFacultyTitle("");
      setStudentId("");
      setProgram("");
      setYearLevel("");
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
            <Text className="mb-1 text-[13px] font-semibold text-[#374151]">School / Faculty</Text>
            <View className="mb-3 rounded-lg border border-[#d1d5db] bg-white">
              <Picker
                selectedValue={school}
                onValueChange={(value) => {
                  setSchool(String(value));
                  setDepartment("");
                  setProgram("");
                }}
              >
                <Picker.Item label="-- Choose School --" value="" />
                {schoolOptions.map((option) => (
                  <Picker.Item key={option} label={option} value={option} />
                ))}
              </Picker>
            </View>

            <Text className="mb-1 text-[13px] font-semibold text-[#374151]">Department</Text>
            <View className="mb-3 rounded-lg border border-[#d1d5db] bg-white">
              <Picker
                selectedValue={department}
                enabled={departmentOptions.length > 0}
                onValueChange={(value) => {
                  setDepartment(String(value));
                  setProgram("");
                }}
              >
                <Picker.Item label="-- Choose Department --" value="" />
                {departmentOptions.map((option) => (
                  <Picker.Item key={option} label={option} value={option} />
                ))}
              </Picker>
            </View>

            <TextInput
              placeholder="Title (e.g. Instructor)"
              value={facultyTitle}
              onChangeText={setFacultyTitle}
              className="mb-3 rounded-lg border border-[#d1d5db] bg-white px-3 py-3"
            />
          </>
        ) : (
          <>
            <Text className="mb-1 text-[13px] font-semibold text-[#374151]">School / Faculty</Text>
            <View className="mb-3 rounded-lg border border-[#d1d5db] bg-white">
              <Picker
                selectedValue={school}
                onValueChange={(value) => {
                  setSchool(String(value));
                  setDepartment("");
                  setProgram("");
                }}
              >
                <Picker.Item label="-- Choose School --" value="" />
                {schoolOptions.map((option) => (
                  <Picker.Item key={option} label={option} value={option} />
                ))}
              </Picker>
            </View>

            <Text className="mb-1 text-[13px] font-semibold text-[#374151]">Department</Text>
            <View className="mb-3 rounded-lg border border-[#d1d5db] bg-white">
              <Picker
                selectedValue={department}
                enabled={departmentOptions.length > 0}
                onValueChange={(value) => {
                  setDepartment(String(value));
                  setProgram("");
                }}
              >
                <Picker.Item label="-- Choose Department --" value="" />
                {departmentOptions.map((option) => (
                  <Picker.Item key={option} label={option} value={option} />
                ))}
              </Picker>
            </View>

            <Text className="mb-1 text-[13px] font-semibold text-[#374151]">Program</Text>
            <View className="mb-3 rounded-lg border border-[#d1d5db] bg-white">
              <Picker
                selectedValue={program}
                enabled={programOptions.length > 0}
                onValueChange={(value) => setProgram(String(value))}
              >
                <Picker.Item label="-- Choose Program --" value="" />
                {programOptions.map((option) => (
                  <Picker.Item key={option} label={option} value={option} />
                ))}
              </Picker>
            </View>

            <TextInput
              placeholder="Year Level (e.g. 2)"
              value={yearLevel}
              onChangeText={setYearLevel}
              keyboardType="number-pad"
              className="mb-3 rounded-lg border border-[#d1d5db] bg-white px-3 py-3"
            />
            <TextInput
              placeholder="Student ID"
              value={studentId}
              onChangeText={setStudentId}
              className="mb-3 rounded-lg border border-[#d1d5db] bg-white px-3 py-3"
            />
          </>
        )}
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
