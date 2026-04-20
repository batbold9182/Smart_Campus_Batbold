import { useEffect, useMemo, useState } from "react";
import logger from "../../utils/logger";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { createUser, getAcademicOptions } from "../../services/adminServices/adminService";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton, AppInput, AppModal } from "../../components/ui";

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
  const [employeeId, setEmployeeId] = useState("");
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
    const controller = new AbortController();
    const loadAcademicOptions = async () => {
      try {
        const data = await getAcademicOptions(controller.signal);
        setAcademicOptions(data || {});
      } catch (err: any) {
        if (err?.name !== "CanceledError" && err?.code !== "ERR_CANCELED") {
          setMessage("❌ Failed to load academic options. Refresh and try again.");
        }
      }
    };

    loadAcademicOptions();
    return () => controller.abort();
  }, []);

  const handleCreate = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setMessage("❌ Please fill in all fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setMessage("❌ Please enter a valid email address");
      return;
    }

    if (selectedRole === "faculty" && (!school.trim() || !department.trim() || !facultyTitle.trim() || !employeeId.trim())) {
      setMessage("❌ School, department, title and employee ID are required for faculty");
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
        employeeId: selectedRole === "faculty" ? employeeId.trim() : undefined,
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
      setEmployeeId("");
      setStudentId("");
      setProgram("");
      setYearLevel("");
    } catch (err: any) {
      const serverMessage = err?.response?.data?.message;
      setMessage(serverMessage ? `❌ ${serverMessage}` : `❌ Failed to create ${selectedRole === "student" ? "student" : "faculty"}`);
      logger.error(err.response?.data || err.message);
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
      <Text className="mb-1 text-app-sm font-semibold text-app-text-secondary">{label}</Text>
      <TouchableOpacity
        className={`min-h-[50px] flex-row items-center justify-between rounded-xl border px-3 ${
          disabled
            ? "border-app-border-light bg-app-bg-muted"
            : "border-app-border bg-app-surface"
        }`}
        onPress={onPress}
        disabled={disabled}
      >
        <Text className={value ? "text-app-text" : "text-app-placeholder"}>
          {value || placeholder}
        </Text>
        <Text className="text-app-md text-app-muted">▾</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-app-bg">
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
          <View className="rounded-2xl border border-app-border-light bg-app-surface p-4 shadow-sm">
            <Text className="text-app-xl font-bold text-app-text">Create User</Text>
            <Text className="mb-4 mt-1 text-app-sm text-app-text-subtle">
              Add faculty or student accounts from one form.
            </Text>

            <View className="mb-3 flex-row gap-2">
              <TouchableOpacity
                className={`flex-1 items-center rounded-xl border px-3 py-3 ${
                  selectedRole === "faculty"
                    ? "border-app-primary bg-app-primary-light"
                    : "border-app-border bg-app-surface"
                }`}
                onPress={() => {
                  setSelectedRole("faculty");
                  setMessage("");
                }}
              >
                <Text className="font-semibold text-app-text">Faculty</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 items-center rounded-xl border px-3 py-3 ${
                  selectedRole === "student"
                    ? "border-app-primary bg-app-primary-light"
                    : "border-app-border bg-app-surface"
                }`}
                onPress={() => {
                  setSelectedRole("student");
                  setMessage("");
                }}
              >
                <Text className="font-semibold text-app-text">Student</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-app-muted text-app-xs mb-3">* Required fields</Text>

            <View className="mb-3">
              <AppInput
                label="Full Name *"
                placeholder="Enter full name"
                value={name}
                onChangeText={setName}
              />
            </View>
            <View className="mb-3">
              <AppInput
                label="Email *"
                placeholder="Enter email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <SelectField
              label="School / Faculty *"
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
              label="Department *"
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
              <>
                <View className="mb-3">
                  <AppInput
                    label="Title *"
                    placeholder="e.g. Instructor, Professor"
                    value={facultyTitle}
                    onChangeText={setFacultyTitle}
                  />
                </View>
                <View className="mb-3">
                  <AppInput
                    label="Employee ID *"
                    placeholder="Enter employee ID"
                    value={employeeId}
                    onChangeText={setEmployeeId}
                  />
                </View>
              </>
            ) : (
              <>
                <SelectField
                  label="Program *"
                  value={program}
                  placeholder={department ? "Select program" : "Select department first"}
                  onPress={() =>
                    openPicker("Select Program", programOptions, program, (value) => setProgram(value))
                  }
                  disabled={programOptions.length === 0}
                />
                <View className="mb-3">
                  <AppInput
                    label="Year Level *"
                    placeholder="e.g. 2"
                    value={yearLevel}
                    onChangeText={setYearLevel}
                    keyboardType="number-pad"
                  />
                </View>
                <View className="mb-3">
                  <AppInput
                    label="Student ID *"
                    placeholder="Enter student ID"
                    value={studentId}
                    onChangeText={setStudentId}
                  />
                </View>
              </>
            )}

            <View className="mb-4">
              <AppInput
                label="Password *"
                placeholder="Enter password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {message ? (
              <Text className="mb-3 text-center text-app-sm text-app-text-subtle">{message}</Text>
            ) : null}

            <AppButton
              title={submitLabel}
              loading={isSubmitting}
              onPress={handleCreate}
            />

            <AppButton
              title="Back to Dashboard"
              variant="outline"
              onPress={() => router.push("/admin/dashboard")}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <AppModal open={selectState.visible} onClose={closePicker} layout="bottom">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-app-md font-bold text-app-text">{selectState.title}</Text>
          <TouchableOpacity onPress={closePicker}>
            <Text className="text-app-sm font-semibold text-app-primary">Done</Text>
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {selectState.options.length === 0 ? (
            <Text className="py-3 text-app-text-subtle">No options available.</Text>
          ) : (
            selectState.options.map((option) => {
              const active = selectState.selectedValue === option;
              return (
                <TouchableOpacity
                  key={option}
                  className={`mb-2 rounded-lg border px-3 py-3 ${
                    active
                      ? "border-app-primary bg-app-primary-bg"
                      : "border-app-border-light bg-app-surface"
                  }`}
                  onPress={() => {
                    selectState.onSelect(option);
                    closePicker();
                  }}
                >
                  <Text className={`font-medium ${active ? "text-app-primary-dark" : "text-app-text"}`}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </AppModal>
    </SafeAreaView>
  );
}
