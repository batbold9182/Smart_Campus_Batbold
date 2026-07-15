import { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { getUsers, deleteUser, toggleUserStatus } from "../../services/adminServices/adminService";
import { AppButton, AppCard, AppInput } from "../../components/ui";
import { SkeletonList } from "../../components/Skeleton";
import UserListItem from "../../components/admin/UserListItem";
import EditUserModal from "../../components/admin/EditUserModal";
import Toast from "react-native-toast-message";
import { confirmAction } from "../../utils/confirm";

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

  const handleDelete = async (id: string) => {
    const target = users.find((u) => u._id === id);
    const ok = await confirmAction(
      "Delete user",
      `Permanently delete ${target?.name || "this user"}? This cannot be undone.`,
      "Delete",
      true
    );
    if (!ok) return;
    try {
      await deleteUser(id);
      Toast.show({ type: "success", text1: "User deleted" });
      loadUsers();
    } catch (err: any) {
      Toast.show({ type: "error", text1: err?.response?.data?.message || "Failed to delete user" });
    }
  };

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
          <Text className="text-app-xl font-bold text-app-text">User Management</Text>
          <Text className="mb-4 mt-1 text-app-sm text-app-muted">
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
              <Text className="text-app-base font-bold text-app-text">{counters?.faculty ?? 0}</Text>
              <Text className="text-app-xs text-app-muted">Faculty</Text>
            </View>
            <View className="flex-1 items-center rounded-xl bg-app-surface py-3">
              <Text className="text-app-base font-bold text-app-text">{counters?.students ?? 0}</Text>
              <Text className="text-app-xs text-app-muted">Students</Text>
            </View>
            <View className="flex-1 items-center rounded-xl bg-app-surface py-3">
              <Text className="text-app-base font-bold text-app-text">{counters?.disabled ?? 0}</Text>
              <Text className="text-app-xs text-app-muted">Disabled</Text>
            </View>
          </View>

          <View className="mb-3 flex-row items-center justify-between gap-3">
            <AppButton
              title="Prev"
              size="sm"
              variant={page === 1 ? "outline" : "primary"}
              disabled={page === 1}
              onPress={() => setPage(page - 1)}
            />
            <Text className="text-app-sm text-app-text">
              Page {page} / {pagination?.totalPages || 1}
            </Text>
            <AppButton
              title="Next"
              size="sm"
              variant={page === pagination?.totalPages ? "outline" : "primary"}
              disabled={page === pagination?.totalPages}
              onPress={() => setPage(page + 1)}
            />
          </View>

          <View className="mb-3">
            <AppInput
              placeholder={`Search ${activeTab}`}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {loading ? (
            <SkeletonList rows={5} />
          ) : filteredUsers.length === 0 ? (
            <View className="items-center rounded-xl border border-dashed border-app-border bg-app-surface py-10">
              <Text className="text-app-base font-semibold text-app-text">
                No {activeTab === "faculty" ? "faculty" : "students"} found
              </Text>
              <Text className="mt-1 text-app-sm text-app-muted">
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
                  onDelete={handleDelete}
                />
              )}
            />
          )}

          <AppButton
            title="Back to Dashboard"
            onPress={() => router.push("/admin/dashboard")}
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
