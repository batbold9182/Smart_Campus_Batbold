import { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { createUser, getAcademicOptions } from "../../services/adminService";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

type AcademicOptions = Record<string, Record<string, string[]>>;

type SelectState = {
  visible: boolean;
  title: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
};

const initialSelectState: SelectState = {
  visible: false,
  title: "",
  options: [],
  selectedValue: "",
  onSelect: () => {},
};

export default function CreateUserScreen() {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectState, setSelectState] = useState<SelectState>(initialSelectState);
  const [academicOptions, setAcademicOptions] = useState<AcademicOptions>({});
  const router = useRouter();

  const schoolOptions = useMemo(() => Object.keys(academicOptions), [academicOptions]);
  const departmentOptions = useMemo(
    () => (school ? Object.keys(academicOptions[school] || {}) : []),
    [academicOptions, school]
  );
  const programOptions = useMemo(
    () => (school && department ? academicOptions[school]?.[department] || [] : []),
    [academicOptions, school, department]
  );

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
      setIsSubmitting(true);
      await createUser(name.trim(), email.trim(), password, selectedRole, {
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitLabel = isSubmitting
    ? "Creating..."
    : selectedRole === "student"
      ? "Create Student"
      : "Create Faculty";

  const openPicker = (
    title: string,
    options: string[],
    selectedValue: string,
    onSelect: (value: string) => void
  ) => {
    setSelectState({
      visible: true,
      title,
      options,
      selectedValue,
      onSelect,
    });
  };

  const closePicker = () => {
    setSelectState((prev) => ({ ...prev, visible: false }));
  };

  const SelectField = ({
    label,
    value,
    placeholder,
    onPress,
    disabled,
  }: {
    label: string;
    value: string;
    placeholder: string;
    onPress: () => void;
    disabled?: boolean;
  }) => (
    <View className="mb-3">
      <Text className="mb-1 text-[13px] font-semibold text-[#374151]">{label}</Text>
      <TouchableOpacity
        className={`min-h-[50px] flex-row items-center justify-between rounded-xl border px-3 ${
          disabled
            ? "border-[#e5e7eb] bg-[#f3f4f6]"
            : "border-[#d1d5db] bg-white"
        }`}
        onPress={onPress}
        disabled={disabled}
      >
        <Text className={value ? "text-[#111827]" : "text-[#9ca3af]"}>
          {value || placeholder}
        </Text>
        <Text className="text-[18px] text-[#6b7280]">▾</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#eef3fb]">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pb-8 pt-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
            <Text className="text-[26px] font-bold text-[#0f172a]">Create User</Text>
            <Text className="mb-4 mt-1 text-[13px] text-[#64748b]">
              Add faculty or student accounts from one form.
            </Text>

            <View className="mb-3 flex-row gap-2">
              <TouchableOpacity
                className={`flex-1 items-center rounded-xl border px-3 py-3 ${
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
                className={`flex-1 items-center rounded-xl border px-3 py-3 ${
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

            <TextInput
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              className="mb-3 rounded-xl border border-[#d1d5db] bg-white px-3 py-3"
            />
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              className="mb-3 rounded-xl border border-[#d1d5db] bg-white px-3 py-3"
            />

            <SelectField
              label="School / Faculty"
              value={school}
              placeholder="Select school"
              onPress={() =>
                openPicker("Select School", schoolOptions, school, (value) => {
                  setSchool(value);
                  setDepartment("");
                  setProgram("");
                })
              }
              disabled={schoolOptions.length === 0}
            />

            <SelectField
              label="Department"
              value={department}
              placeholder={school ? "Select department" : "Select school first"}
              onPress={() =>
                openPicker("Select Department", departmentOptions, department, (value) => {
                  setDepartment(value);
                  setProgram("");
                })
              }
              disabled={departmentOptions.length === 0}
            />

            {selectedRole === "faculty" ? (
              <TextInput
                placeholder="Title (e.g. Instructor)"
                value={facultyTitle}
                onChangeText={setFacultyTitle}
                className="mb-3 rounded-xl border border-[#d1d5db] bg-white px-3 py-3"
              />
            ) : (
              <>
                <SelectField
                  label="Program"
                  value={program}
                  placeholder={department ? "Select program" : "Select department first"}
                  onPress={() =>
                    openPicker("Select Program", programOptions, program, (value) => setProgram(value))
                  }
                  disabled={programOptions.length === 0}
                />
                <TextInput
                  placeholder="Year Level (e.g. 2)"
                  value={yearLevel}
                  onChangeText={setYearLevel}
                  keyboardType="number-pad"
                  className="mb-3 rounded-xl border border-[#d1d5db] bg-white px-3 py-3"
                />
                <TextInput
                  placeholder="Student ID"
                  value={studentId}
                  onChangeText={setStudentId}
                  className="mb-3 rounded-xl border border-[#d1d5db] bg-white px-3 py-3"
                />
              </>
            )}

            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="mb-4 rounded-xl border border-[#d1d5db] bg-white px-3 py-3"
            />

            {message ? (
              <Text className="mb-3 text-center text-[13px] text-[#334155]">{message}</Text>
            ) : null}

            <TouchableOpacity
              className="mb-2 items-center rounded-xl bg-[#2563eb] px-4 py-3"
              onPress={handleCreate}
              disabled={isSubmitting}
            >
              <Text className="text-[15px] font-semibold text-white">{submitLabel}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="items-center rounded-xl border border-[#cbd5e1] bg-white px-4 py-3"
              onPress={() => router.push("../dashboard")}
            >
              <Text className="text-[15px] font-semibold text-[#0f172a]">Back to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal transparent visible={selectState.visible} animationType="fade" onRequestClose={closePicker}>
        <Pressable className="flex-1 items-center justify-end bg-black/40 px-4 pb-6" onPress={closePicker}>
          <Pressable className="max-h-[70%] w-full rounded-2xl bg-white p-4" onPress={() => {}}>
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-[17px] font-bold text-[#0f172a]">{selectState.title}</Text>
              <TouchableOpacity onPress={closePicker}>
                <Text className="text-[14px] font-semibold text-[#2563eb]">Done</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectState.options.length === 0 ? (
                <Text className="py-3 text-[#64748b]">No options available.</Text>
              ) : (
                selectState.options.map((option) => {
                  const active = selectState.selectedValue === option;
                  return (
                    <TouchableOpacity
                      key={option}
                      className={`mb-2 rounded-lg border px-3 py-3 ${
                        active
                          ? "border-[#2563eb] bg-[#eff6ff]"
                          : "border-[#e5e7eb] bg-white"
                      }`}
                      onPress={() => {
                        selectState.onSelect(option);
                        closePicker();
                      }}
                    >
                      <Text className={`font-medium ${active ? "text-[#1d4ed8]" : "text-[#111827]"}`}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
