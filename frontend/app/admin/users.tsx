import { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { getUsers, deleteUser, toggleUserStatus } from "../../services/adminServices/adminService";
import { AppButton, AppCard, AppInput } from "../../components/ui";
import { SkeletonList } from "../../components/Skeleton";
import UserListItem from "../../components/admin/UserListItem";
import EditUserModal from "../../components/admin/EditUserModal";

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

  const editingUser = users.find((u) => u._id === editingUserId);

  const filteredUsers = (users || []).filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={["top"]}>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-6">
        <AppCard className="rounded-2xl border border-app-border-light bg-app-surface p-4 shadow-sm">
          <Text className="text-[24px] font-bold text-app-text">User Management</Text>
          <Text className="mb-4 mt-1 text-[13px] text-app-muted">
            Browse, filter, and manage faculty and student accounts.
          </Text>

          <View className="mb-3 flex-row gap-2">
            {(["faculty", "student"] as const).map((role) => (
              <TouchableOpacity
                key={role}
                className={`flex-1 items-center rounded-xl border px-3 py-3 ${
                  activeTab === role ? "border-app-primary bg-app-primary-light" : "border-app-border bg-app-surface"
                }`}
                onPress={() => {
                  setActiveTab(role);
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
              className={`rounded-lg px-4 py-2 ${page === 1 ? "bg-app-disabled" : "bg-app-primary"}`}
              disabled={page === 1}
              onPress={() => setPage(page - 1)}
            >
              <Text className="font-semibold text-white">Prev</Text>
            </TouchableOpacity>
            <Text className="text-[13px] text-app-text">
              Page {page} / {pagination?.totalPages || 1}
            </Text>
            <TouchableOpacity
              className={`rounded-lg px-4 py-2 ${
                page === pagination?.totalPages ? "bg-app-disabled" : "bg-app-primary"
              }`}
              disabled={page === pagination?.totalPages}
              onPress={() => setPage(page + 1)}
            >
              <Text className="font-semibold text-white">Next</Text>
            </TouchableOpacity>
          </View>

          <AppInput
            placeholder={`Search ${activeTab}`}
            value={search}
            onChangeText={setSearch}
            className="mb-3 rounded-lg border border-app-border bg-app-surface px-3 py-3"
          />

          {loading ? (
            <SkeletonList rows={5} />
          ) : filteredUsers.length === 0 ? (
            <View className="items-center rounded-xl border border-dashed border-app-border bg-app-surface py-10">
              <Text className="text-[16px] font-semibold text-app-text">
                No {activeTab === "faculty" ? "faculty" : "students"} found
              </Text>
              <Text className="mt-1 text-[13px] text-app-muted">
                {search ? "Try a different search term" : "No accounts have been created yet"}
              </Text>
            </View>
          ) : null}

          {!loading && (
            <FlatList
              data={filteredUsers}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <UserListItem
                  item={item}
                  activeTab={activeTab}
                  expandedUserId={expandedUserId}
                  onToggle={(id) => setExpandedUserId((prev) => (prev === id ? null : id))}
                  onEdit={(u) => setEditingUserId(u._id)}
                  onToggleStatus={(id) => toggleUserStatus(id).then(loadUsers)}
                  onDelete={(id) => deleteUser(id).then(loadUsers)}
                />
              )}
            />
          )}

          <AppButton
            title="Back to Dashboard"
            variant="outline"
            onPress={() => router.push("/admin/dashboard")}
            className="items-center rounded-xl border border-app-border bg-app-surface px-4 py-3"
            textClassName="font-semibold text-app-text"
          />
        </AppCard>
      </ScrollView>

      <EditUserModal
        editingUserId={editingUserId}
        editingUser={editingUser}
        onClose={() => setEditingUserId(null)}
        onSaved={loadUsers}
      />
    </SafeAreaView>
  );
}
