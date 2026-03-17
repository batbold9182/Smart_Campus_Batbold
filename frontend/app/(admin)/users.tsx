import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { getUsers, deleteUser, toggleUserStatus } from "../../services/adminService";
import { useRouter } from "expo-router";
import { adminStyles } from "../../styles/adminStyles";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"faculty" | "student">("faculty");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [counters, setCounters] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const router = useRouter();

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


  const handleDelete = async (id: string) => {
    await deleteUser(id);
    loadUsers();
  };

  const filteredUsers = (users || []).filter(
  (user) =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
);

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
          onPress={() => router.push("../dashboard")}
        >
          <Text className="font-semibold text-app-text">Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}
