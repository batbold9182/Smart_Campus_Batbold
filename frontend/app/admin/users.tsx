import { useCallback, useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import { getUsers, deleteUser, toggleUserStatus, updateUser, getAcademicOptions } from "../../services/adminServices/adminService";
import { useRouter } from "expo-router";
import { adminStyles } from "../../styles/adminStyles";
import { SafeAreaView } from "react-native-safe-area-context";

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

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"faculty" | "student">("faculty");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [counters, setCounters] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [updating, setUpdating] = useState(false);
  const [academicOptions, setAcademicOptions] = useState<AcademicOptions>({});
  const [pickerState, setPickerState] = useState<PickerState>(initialPickerState);
  const router = useRouter();

  const schoolOptions = useMemo(() => Object.keys(academicOptions), [academicOptions]);
  const departmentOptions = useMemo(
    () => (editForm.school ? Object.keys(academicOptions[editForm.school] || {}) : []),
    [academicOptions, editForm.school]
  );
  const programOptions = useMemo(
    () => (editForm.school && editForm.department ? academicOptions[editForm.school]?.[editForm.department] || [] : []),
    [academicOptions, editForm.school, editForm.department]
  );

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUsers(page, activeTab);
      setUsers(data.users || []);
      setPagination(data.pagination);
      setCounters(data.counters);
    } finally {
      setLoading(false);
    }
  }, [page, activeTab]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    const loadAcademicOptions = async () => {
      try {
        const data = await getAcademicOptions();
        setAcademicOptions(data || {});
      } catch {
        console.log("Failed to load academic options");
      }
    };
    loadAcademicOptions();
  }, []);


  const handleDelete = async (id: string) => {
    await deleteUser(id);
    loadUsers();
  };

  const handleEditOpen = (user: any) => {
    setEditingUserId(user._id);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      school: user.school || "",
      department: user.department || "",
      title: user.role === "faculty" ? user.title || "" : "",
      employeeId: user.role === "faculty" ? user.employeeId || "" : "",
      studentId: user.role === "student" ? user.studentId || "" : "",
      program: user.role === "student" ? user.program || "" : "",
      yearLevel: user.role === "student" ? user.yearLevel?.toString() || "" : "",
    });
  };

  const handleEditClose = () => {
    setEditingUserId(null);
    setEditForm({});
  };

  const openPicker = (
    title: string,
    options: string[],
    selectedValue: string,
    onSelect: (value: string) => void
  ) => {
    setPickerState({
      visible: true,
      title,
      options,
      selectedValue,
      onSelect,
    });
  };

  const closePicker = () => {
    setPickerState((prev) => ({ ...prev, visible: false }));
  };

  const handleUpdateUser = async () => {
    if (!editingUserId) return;
    
    const editingUser = users.find(u => u._id === editingUserId);
    if (!editingUser) return;

    if (!editForm.name || !editForm.email) {
      Alert.alert("Error", "Name and email are required");
      return;
    }

    try {
      setUpdating(true);
      const updates: any = {
        name: editForm.name,
        email: editForm.email,
      };

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
      Alert.alert("Success", "User updated successfully");
      handleEditClose();
      loadUsers();
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Failed to update user");
    } finally {
      setUpdating(false);
    }
  };

  const filteredUsers = (users || []).filter(
  (user) =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
);

  const editingUser = users.find(u => u._id === editingUserId);

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={["top"]}>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-6">
        <View className={adminStyles.card}>
          <Text className="text-[24px] font-bold text-app-text">User Management</Text>
          <Text className="mb-4 mt-1 text-[13px] text-app-muted">
            Browse, filter, and manage faculty and student accounts.
          </Text>

        <View className="mb-3 flex-row gap-2">
          {["faculty", "student"].map((role) => (
            <TouchableOpacity
              key={role}
              className={`flex-1 items-center rounded-xl border px-3 py-3 ${
                activeTab === role ? "border-blue-300 bg-blue-50" : "border-app-border bg-white"
              }`}
              onPress={() => {
                setActiveTab(role as any);
                setPage(1);
                setExpandedUserId(null);
                setEditingUserId(null);
              }}
            >
              <Text className="font-bold text-app-text">
                {role === "faculty" ? "Faculty" : "Students"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="mb-4 flex-row justify-between gap-2">
          <View className="flex-1 items-center rounded-xl bg-app-surface py-3">
            <Text className="text-[16px] font-bold text-app-text">{counters?.faculty ?? 0}</Text>
            <Text className="text-[11px] text-app-muted">Faculty</Text>
          </View>
          <View className="flex-1 items-center rounded-xl bg-app-surface py-3">
            <Text className="text-[16px] font-bold text-app-text">{counters?.students ?? 0}</Text>
            <Text className="text-[11px] text-app-muted">Students</Text>
          </View>
          <View className="flex-1 items-center rounded-xl bg-app-surface py-3">
            <Text className="text-[16px] font-bold text-app-text">{counters?.disabled ?? 0}</Text>
            <Text className="text-[11px] text-app-muted">Disabled</Text>
          </View>
        </View>

        <View className="mb-3 flex-row items-center justify-between">
          <TouchableOpacity
            className={`rounded-lg px-4 py-2 ${page === 1 ? "bg-[#cbd5e1]" : "bg-blue-500"}`}
            disabled={page === 1}
            onPress={() => setPage(page - 1)}
          >
            <Text className="font-semibold text-white">Prev</Text>
          </TouchableOpacity>
          <Text className="text-[13px] text-app-text">Page {page} / {pagination?.totalPages || 1}</Text>
          <TouchableOpacity
            className={`rounded-lg px-4 py-2 ${page === pagination?.totalPages ? "bg-[#cbd5e1]" : "bg-blue-500"}`}
            disabled={page === pagination?.totalPages}
            onPress={() => setPage(page + 1)}
          >
            <Text className="font-semibold text-white">Next</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          placeholder={`Search ${activeTab}`}
          value={search}
          onChangeText={setSearch}
          className="mb-3 rounded-lg border border-app-border bg-app-surface px-3 py-3"
        />
        {loading && <Text className="mb-2 text-app-muted">Loading users...</Text>}

        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item._id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View className="mb-3 rounded-xl border border-app-border bg-white p-3">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  setExpandedUserId((prev) => (prev === item._id ? null : item._id))
                }
              >
                <Text className="mb-1 text-[16px] font-semibold text-app-text">{item.name}</Text>
                <Text className="mb-1 text-[13px] text-[#4b5563]">{item.email}</Text>
                {activeTab === "faculty" ? (
                  <View className="mb-2 gap-1">
                    <Text className="text-[12px] text-[#374151]">School: {item.school || "-"}</Text>
                    <Text className="text-[12px] text-[#374151]">Department: {item.department || "-"}</Text>
                    <Text className="text-[12px] text-[#374151]">Title: {item.title || "-"}</Text>
                    <Text className="text-[12px] text-[#374151]">Employee ID: {item.employeeId || "-"}</Text>
                  </View>
                ) : (
                  <View className="mb-2 gap-1">
                    <Text className="text-[12px] text-[#374151]">Program: {item.program || "-"}</Text>
                    <Text className="text-[12px] text-[#374151]">Year: {item.yearLevel || "-"}</Text>
                    <Text className="text-[12px] text-[#374151]">Student ID: {item.studentId || "-"}</Text>
                  </View>
                )}
                <Text className="mb-2 text-[12px] font-medium text-[#2563eb]">
                  {expandedUserId === item._id ? "Hide actions" : "Show actions"}
                </Text>
              </TouchableOpacity>

              {expandedUserId === item._id ? (
                <View className="gap-[6px]">
                  <TouchableOpacity
                    className="items-center rounded-lg bg-blue-500 px-3 py-2"
                    onPress={() => handleEditOpen(item)}
                  >
                    <Text className="font-semibold text-white">Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`items-center rounded-lg px-3 py-2 ${item.isActive ? "bg-amber-500" : "bg-emerald-600"}`}
                    onPress={() => toggleUserStatus(item._id).then(loadUsers)}
                  >
                    <Text className="font-semibold text-white">{item.isActive ? "Disable" : "Enable"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="items-center rounded-lg bg-red-500 px-3 py-2"
                    onPress={() => handleDelete(item._id)}
                  >
                    <Text className="font-semibold text-white">Delete</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          )}
        />

        <TouchableOpacity
          className="items-center rounded-xl border border-app-border bg-white px-4 py-3"
          onPress={() => router.push("/admin/dashboard")}
        >
          <Text className="font-semibold text-app-text">Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>

    {/* Edit Modal */}
    <Modal 
      visible={editingUserId !== null} 
      transparent 
      animationType="fade"
      onRequestClose={handleEditClose}
    >
      <View className="relative flex-1 items-center justify-center bg-black/50">
        <SafeAreaView className="w-[90%] max-w-sm">
          <ScrollView className="rounded-2xl bg-white p-5">
            <View className="mb-4">
              <Text className="text-[20px] font-bold text-app-text">Edit User</Text>
              <Text className="mt-1 text-[13px] text-app-muted">{editingUser?.name}</Text>
            </View>

            {/* Name Field */}
            <View className="mb-4">
              <Text className="mb-2 text-[12px] font-semibold text-app-text">Name *</Text>
              <TextInput
                value={editForm.name}
                onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                placeholder="Enter name"
                className="rounded-lg border border-app-border bg-app-surface px-3 py-2"
              />
            </View>

            {/* Email Field */}
            <View className="mb-4">
              <Text className="mb-2 text-[12px] font-semibold text-app-text">Email *</Text>
              <TextInput
                value={editForm.email}
                onChangeText={(text) => setEditForm({ ...editForm, email: text })}
                placeholder="Enter email"
                keyboardType="email-address"
                className="rounded-lg border border-app-border bg-app-surface px-3 py-2"
              />
            </View>

            {/* School Field */}
            <View className="mb-4">
              <Text className="mb-2 text-[12px] font-semibold text-app-text">School</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                className="min-h-[48px] flex-row items-center justify-between rounded-lg border border-app-border bg-app-surface px-3 py-2"
                onPress={() => openPicker("School", schoolOptions, editForm.school, (value) => {
                  setEditForm({ ...editForm, school: value, department: "", program: "" });
                  closePicker();
                })}
              >
                <Text className={editForm.school ? "text-app-text" : "text-[#9ca3af]"}>
                  {editForm.school || "Select school"}
                </Text>
                <Text className="text-[16px] text-app-muted">▾</Text>
              </TouchableOpacity>
            </View>

            {/* Department Field */}
            <View className="mb-4">
              <Text className="mb-2 text-[12px] font-semibold text-app-text">Department</Text>
              <TouchableOpacity
                activeOpacity={editForm.school ? 0.7 : 0.5}
                disabled={!editForm.school}
                className={`min-h-[48px] flex-row items-center justify-between rounded-lg border px-3 py-2 ${
                  editForm.school ? "border-app-border bg-app-surface" : "border-[#e5e7eb] bg-[#f9fafb]"
                }`}
                onPress={() => openPicker("Department", departmentOptions, editForm.department, (value) => {
                  setEditForm({ ...editForm, department: value, program: "" });
                  closePicker();
                })}
              >
                <Text className={editForm.department ? "text-app-text" : "text-[#9ca3af]"}>
                  {editForm.department || "Select department"}
                </Text>
                <Text className={`text-[16px] ${editForm.school ? "text-app-muted" : "text-[#d1d5db]"}`}>▾</Text>
              </TouchableOpacity>
            </View>

            {/* Faculty-specific Fields */}
            {editingUser?.role === "faculty" && (
              <>
                <View className="mb-4">
                  <Text className="mb-2 text-[12px] font-semibold text-app-text">Title</Text>
                  <TextInput
                    value={editForm.title}
                    onChangeText={(text) => setEditForm({ ...editForm, title: text })}
                    placeholder="Enter title"
                    className="rounded-lg border border-app-border bg-app-surface px-3 py-2"
                  />
                </View>
                <View className="mb-4">
                  <Text className="mb-2 text-[12px] font-semibold text-app-text">Employee ID</Text>
                  <TextInput
                    value={editForm.employeeId}
                    onChangeText={(text) => setEditForm({ ...editForm, employeeId: text })}
                    placeholder="Enter employee ID"
                    className="rounded-lg border border-app-border bg-app-surface px-3 py-2"
                  />
                </View>
              </>
            )}

            {/* Student-specific Fields */}
            {editingUser?.role === "student" && (
              <>
                <View className="mb-4">
                  <Text className="mb-2 text-[12px] font-semibold text-app-text">Student ID</Text>
                  <TextInput
                    value={editForm.studentId}
                    onChangeText={(text) => setEditForm({ ...editForm, studentId: text })}
                    placeholder="Enter student ID"
                    className="rounded-lg border border-app-border bg-app-surface px-3 py-2"
                  />
                </View>

                <View className="mb-4">
                  <Text className="mb-2 text-[12px] font-semibold text-app-text">Program</Text>
                  <TouchableOpacity
                    activeOpacity={editForm.school && editForm.department ? 0.7 : 0.5}
                    disabled={!editForm.school || !editForm.department}
                    className={`min-h-[48px] flex-row items-center justify-between rounded-lg border px-3 py-2 ${
                      editForm.school && editForm.department ? "border-app-border bg-app-surface" : "border-[#e5e7eb] bg-[#f9fafb]"
                    }`}
                    onPress={() => openPicker("Program", programOptions, editForm.program, (value) => {
                      setEditForm({ ...editForm, program: value });
                      closePicker();
                    })}
                  >
                    <Text className={editForm.program ? "text-app-text" : "text-[#9ca3af]"}>
                      {editForm.program || "Select program"}
                    </Text>
                    <Text className={`text-[16px] ${editForm.school && editForm.department ? "text-app-muted" : "text-[#d1d5db]"}`}>▾</Text>
                  </TouchableOpacity>
                </View>

                <View className="mb-4">
                  <Text className="mb-2 text-[12px] font-semibold text-app-text">Year Level</Text>
                  <TextInput
                    value={editForm.yearLevel}
                    onChangeText={(text) => setEditForm({ ...editForm, yearLevel: text })}
                    placeholder="Enter year level"
                    keyboardType="number-pad"
                    className="rounded-lg border border-app-border bg-app-surface px-3 py-2"
                  />
                </View>
              </>
            )}

            {/* Action Buttons */}
            <View className="mt-6 flex-row gap-3">
              <TouchableOpacity
                className="flex-1 items-center rounded-lg bg-gray-300 px-4 py-3"
                onPress={handleEditClose}
                disabled={updating}
              >
                <Text className="font-semibold text-app-text">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 items-center rounded-lg bg-blue-500 px-4 py-3"
                onPress={handleUpdateUser}
                disabled={updating}
              >
                <Text className="font-semibold text-white">
                  {updating ? "Saving..." : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>

        {pickerState.visible ? (
          <View className="absolute inset-0 justify-end">
            <TouchableOpacity
              className="absolute inset-0"
              activeOpacity={1}
              onPress={closePicker}
            />
            <View className="max-h-[60%] rounded-t-3xl bg-white p-5">
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-[18px] font-bold text-app-text">{pickerState.title}</Text>
                <TouchableOpacity onPress={closePicker}>
                  <Text className="text-[24px] text-app-muted">X</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {pickerState.options.map((option) => (
                  <TouchableOpacity
                    key={option}
                    className={`border-b border-app-border px-4 py-3 ${
                      pickerState.selectedValue === option ? "bg-blue-50" : "bg-white"
                    }`}
                    onPress={() => {
                      pickerState.onSelect(option);
                      closePicker();
                    }}
                  >
                    <Text
                      className={`text-[16px] ${
                        pickerState.selectedValue === option
                          ? "font-bold text-blue-600"
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
      </View>
    </Modal>
    </SafeAreaView>
  );
}
