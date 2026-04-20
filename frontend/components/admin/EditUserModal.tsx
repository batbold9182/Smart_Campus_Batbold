import { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import Toast from "react-native-toast-message";
import { AppButton, AppInput, AppModal } from "../ui";
import { getAcademicOptions, updateUser } from "../../services/adminServices/adminService";
import logger from "../../utils/logger";

type AcademicOptions = Record<string, Record<string, string[]>>;

type PickerState = {
  visible: boolean;
  title: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
};

const initialPickerState: PickerState = {
  visible: false,
  title: "",
  options: [],
  selectedValue: "",
  onSelect: () => {},
};

type Props = {
  editingUserId: string | null;
  editingUser: any | undefined;
  onClose: () => void;
  onSaved: () => void;
};

export default function EditUserModal({ editingUserId, editingUser, onClose, onSaved }: Props) {
  const [editForm, setEditForm] = useState<any>({});
  const [updating, setUpdating] = useState(false);
  const [academicOptions, setAcademicOptions] = useState<AcademicOptions>({});
  const [pickerState, setPickerState] = useState<PickerState>(initialPickerState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const schoolOptions = useMemo(() => Object.keys(academicOptions), [academicOptions]);
  const departmentOptions = useMemo(
    () => (editForm.school ? Object.keys(academicOptions[editForm.school] || {}) : []),
    [academicOptions, editForm.school]
  );
  const programOptions = useMemo(
    () =>
      editForm.school && editForm.department
        ? academicOptions[editForm.school]?.[editForm.department] || []
        : [],
    [academicOptions, editForm.school, editForm.department]
  );

  useEffect(() => {
    if (!editingUser) return;
    setErrors({});
    setEditForm({
      name: editingUser.name || "",
      email: editingUser.email || "",
      school: editingUser.school || "",
      department: editingUser.department || "",
      title: editingUser.role === "faculty" ? editingUser.title || "" : "",
      employeeId: editingUser.role === "faculty" ? editingUser.employeeId || "" : "",
      studentId: editingUser.role === "student" ? editingUser.studentId || "" : "",
      program: editingUser.role === "student" ? editingUser.program || "" : "",
      yearLevel: editingUser.role === "student" ? editingUser.yearLevel?.toString() || "" : "",
    });
  }, [editingUser]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAcademicOptions();
        setAcademicOptions(data || {});
      } catch {
        logger.warn("Failed to load academic options");
      }
    };
    load();
  }, []);

  const openPicker = (
    title: string,
    options: string[],
    selectedValue: string,
    onSelect: (value: string) => void
  ) => {
    setPickerState({ visible: true, title, options, selectedValue, onSelect });
  };

  const closePicker = () => setPickerState((prev) => ({ ...prev, visible: false }));

  const handleSave = async () => {
    if (!editingUserId || !editingUser) return;

    const newErrors: Record<string, string> = {};
    if (!editForm.name) newErrors.name = "Name is required.";
    if (!editForm.email) newErrors.email = "Email is required.";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    try {
      setUpdating(true);
      const updates: any = { name: editForm.name, email: editForm.email };

      if (editingUser.role === "faculty") {
        updates.school = editForm.school || null;
        updates.department = editForm.department || null;
        updates.title = editForm.title || null;
        updates.employeeId = editForm.employeeId || null;
      } else if (editingUser.role === "student") {
        updates.school = editForm.school || null;
        updates.department = editForm.department || null;
        updates.studentId = editForm.studentId || null;
        updates.program = editForm.program || null;
        updates.yearLevel = editForm.yearLevel ? parseInt(editForm.yearLevel) : null;
      }

      await updateUser(editingUserId, updates);
      Toast.show({ type: "success", text1: "User updated successfully" });
      onClose();
      onSaved();
    } catch (error: any) {
      Toast.show({ type: "error", text1: error.response?.data?.message || "Failed to update user" });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <AppModal open={editingUserId !== null} onClose={() => { setErrors({}); onClose(); }} layout="center">
      <ScrollView className="rounded-2xl bg-app-surface p-5">
        <View className="mb-4">
          <Text className="text-app-lg font-bold text-app-text">Edit User</Text>
          <Text className="mt-1 text-app-sm text-app-muted">{editingUser?.name}</Text>
        </View>

        <View className="mb-3">
          <AppInput
            label="Name *"
            value={editForm.name}
            onChangeText={(text) => { setEditForm({ ...editForm, name: text }); if (errors.name) setErrors((e) => ({ ...e, name: "" })); }}
            placeholder="Enter name"
            error={errors.name}
          />
        </View>

        <View className="mb-3">
          <AppInput
            label="Email *"
            value={editForm.email}
            onChangeText={(text) => { setEditForm({ ...editForm, email: text }); if (errors.email) setErrors((e) => ({ ...e, email: "" })); }}
            placeholder="Enter email"
            keyboardType="email-address"
            error={errors.email}
          />
        </View>

        <View className="mb-3">
          <Text className="mb-1 text-app-xs font-semibold text-app-muted">School</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            className="min-h-[48px] flex-row items-center justify-between rounded-app-md border border-app-input-border bg-app-surface px-3 py-2"
            onPress={() =>
              openPicker("School", schoolOptions, editForm.school, (value) => {
                setEditForm({ ...editForm, school: value, department: "", program: "" });
                closePicker();
              })
            }
          >
            <Text className={editForm.school ? "text-app-text" : "text-app-placeholder"}>
              {editForm.school || "Select school"}
            </Text>
            <Text className="text-app-base text-app-muted">▾</Text>
          </TouchableOpacity>
        </View>

        <View className="mb-3">
          <Text className="mb-1 text-app-xs font-semibold text-app-muted">Department</Text>
          <TouchableOpacity
            activeOpacity={editForm.school ? 0.7 : 0.5}
            disabled={!editForm.school}
            className={`min-h-[48px] flex-row items-center justify-between rounded-app-md border px-3 py-2 ${
              editForm.school
                ? "border-app-input-border bg-app-surface"
                : "border-app-border-light bg-app-bg-subtle"
            }`}
            onPress={() =>
              openPicker("Department", departmentOptions, editForm.department, (value) => {
                setEditForm({ ...editForm, department: value, program: "" });
                closePicker();
              })
            }
          >
            <Text className={editForm.department ? "text-app-text" : "text-app-placeholder"}>
              {editForm.department || "Select department"}
            </Text>
            <Text className={`text-app-base ${editForm.school ? "text-app-muted" : "text-app-border"}`}>▾</Text>
          </TouchableOpacity>
        </View>

        {editingUser?.role === "faculty" && (
          <>
            <View className="mb-3">
              <AppInput
                label="Title"
                value={editForm.title}
                onChangeText={(text) => setEditForm({ ...editForm, title: text })}
                placeholder="Enter title"
              />
            </View>
            <View className="mb-3">
              <AppInput
                label="Employee ID"
                value={editForm.employeeId}
                onChangeText={(text) => setEditForm({ ...editForm, employeeId: text })}
                placeholder="Enter employee ID"
              />
            </View>
          </>
        )}

        {editingUser?.role === "student" && (
          <>
            <View className="mb-3">
              <AppInput
                label="Student ID"
                value={editForm.studentId}
                onChangeText={(text) => setEditForm({ ...editForm, studentId: text })}
                placeholder="Enter student ID"
              />
            </View>

            <View className="mb-3">
              <Text className="mb-1 text-app-xs font-semibold text-app-muted">Program</Text>
              <TouchableOpacity
                activeOpacity={editForm.school && editForm.department ? 0.7 : 0.5}
                disabled={!editForm.school || !editForm.department}
                className={`min-h-[48px] flex-row items-center justify-between rounded-app-md border px-3 py-2 ${
                  editForm.school && editForm.department
                    ? "border-app-input-border bg-app-surface"
                    : "border-app-border-light bg-app-bg-subtle"
                }`}
                onPress={() =>
                  openPicker("Program", programOptions, editForm.program, (value) => {
                    setEditForm({ ...editForm, program: value });
                    closePicker();
                  })
                }
              >
                <Text className={editForm.program ? "text-app-text" : "text-app-placeholder"}>
                  {editForm.program || "Select program"}
                </Text>
                <Text className={`text-app-base ${editForm.school && editForm.department ? "text-app-muted" : "text-app-border"}`}>
                  ▾
                </Text>
              </TouchableOpacity>
            </View>

            <View className="mb-3">
              <AppInput
                label="Year Level"
                value={editForm.yearLevel}
                onChangeText={(text) => setEditForm({ ...editForm, yearLevel: text })}
                placeholder="Enter year level"
                keyboardType="number-pad"
              />
            </View>
          </>
        )}

        <View className="mt-6 flex-row gap-3">
          <View className="flex-1">
            <AppButton
              title="Cancel"
              variant="outline"
              onPress={() => { setErrors({}); onClose(); }}
              loading={updating}
            />
          </View>
          <View className="flex-1">
            <AppButton
              title="Save"
              loading={updating}
              onPress={handleSave}
            />
          </View>
        </View>
      </ScrollView>

      {pickerState.visible ? (
        <View className="absolute inset-0 justify-end">
          <TouchableOpacity className="absolute inset-0" activeOpacity={1} onPress={closePicker} />
          <View className="max-h-[60%] rounded-t-3xl bg-app-surface p-5">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-app-md font-bold text-app-text">{pickerState.title}</Text>
              <TouchableOpacity onPress={closePicker}>
                <Text className="text-app-xl text-app-muted">✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {pickerState.options.map((option) => (
                <TouchableOpacity
                  key={option}
                  className={`border-b border-app-border px-4 py-3 ${
                    pickerState.selectedValue === option ? "bg-app-primary-light" : "bg-app-surface"
                  }`}
                  onPress={() => {
                    pickerState.onSelect(option);
                    closePicker();
                  }}
                >
                  <Text
                    className={`text-app-base ${
                      pickerState.selectedValue === option
                        ? "font-bold text-app-primary"
                        : "text-app-text"
                    }`}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      ) : null}
    </AppModal>
  );
}
