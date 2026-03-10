import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { getUsers, deleteUser, toggleUserStatus } from "../../services/adminService";
import { useRouter } from "expo-router";
import { adminStyles } from "../../styles/adminStyles";

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
    <ScrollView className="flex-1 bg-[#f5f7fb]" contentContainerClassName="p-5 pb-6">
      <View className={adminStyles.card}>
        <Text className="mb-3 text-[22px] font-bold text-[#111827]">👥 User Management</Text>

        <View className="mb-3 flex-row">
          {["faculty", "student"].map((role) => (
            <TouchableOpacity
              key={role}
              className={`flex-1 items-center border p-[10px] ${
                activeTab === role ? "border-[#9ca3af] bg-[#e5e7eb]" : "border-[#d1d5db] bg-white"
              }`}
              onPress={() => {
                setActiveTab(role as any);
                setPage(1);
                setExpandedUserId(null);
              }}
            >
              <Text className="font-bold text-[#111827]">
                {role === "faculty" ? "Faculty" : "Students"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="mb-3 flex-row justify-around">
          <Text>Faculty: {counters?.faculty}</Text>
          <Text>Students: {counters?.students}</Text>
          <Text>Disabled: {counters?.disabled}</Text>
        </View>

        <View className="mb-3 flex-row items-center justify-between">
          <Button
            title="Prev"
            disabled={page === 1}
            onPress={() => setPage(page - 1)}
          />
          <Text>Page {page}</Text>
          <Button
            title="Next"
            disabled={page === pagination?.totalPages}
            onPress={() => setPage(page + 1)}
          />
        </View>

        <TextInput
          placeholder={`Search ${activeTab}`}
          value={search}
          onChangeText={setSearch}
          className="mb-3 rounded-lg border border-[#d1d5db] bg-white px-3 py-3"
        />
        {loading && <Text className="mb-2 text-[#6b7280]">Loading users...</Text>}

        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item._id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View className="mb-[10px] rounded-lg border-b border-[#d1d5db] pb-2">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  setExpandedUserId((prev) => (prev === item._id ? null : item._id))
                }
              >
                <Text className="mb-2 font-semibold text-[#111827]">{item.name}</Text>
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
                  <Button
                    title={item.isActive ? "Disable" : "Enable"}
                    color={item.isActive ? "orange" : "green"}
                    onPress={() => toggleUserStatus(item._id).then(loadUsers)}
                  />
                  <Button
                    title="Delete"
                    color="red"
                    onPress={() => handleDelete(item._id)}
                  />
                </View>
              ) : null}
            </View>
          )}
        />

        <Button title="Go Back" onPress={() => router.push("../dashboard")} />
      </View>
    </ScrollView>
  );
}
