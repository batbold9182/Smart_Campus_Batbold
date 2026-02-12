import { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity
} from "react-native";
import { getUsers, deleteUser, toggleUserStatus } from "../../services/adminService";
import { useRouter } from "expo-router";

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"faculty" | "student">("faculty");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [counters, setCounters] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const loadUsers = async () => {
  try {
    setLoading(true);
    const data = await getUsers(page, activeTab);
    setUsers(data.users || []);
    setPagination(data.pagination);
    setCounters(data.counters);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    loadUsers();
  }, [page, activeTab]);


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
    <View style={styles.container}>
      <Text style={styles.title}>👥 User Management</Text>

      {/* 🔘 TABS */}
      <View style={styles.tabs}>
        {["faculty", "student"].map((role) => (
          <TouchableOpacity
            key={role}
            style={[
              styles.tab,
              activeTab === role && styles.activeTab,
            ]}
            onPress={() => {
              setActiveTab(role as any);
              setPage(1);
            }}
          >
            <Text style={styles.tabText}>
              {role === "faculty" ? "Faculty" : "Students"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
        
      <View style={styles.counters}>
        <Text>Faculty: {counters?.faculty}</Text>
        <Text>Students: {counters?.students}</Text>
        <Text>Disabled: {counters?.disabled}</Text>
      </View>
      <View style={styles.pagination}>
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
      {/* 🔍 SEARCH */}
      <TextInput
        placeholder={`Search ${activeTab}`}
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />
        {loading && <Text>Loading users...</Text>}
      {/* 📋 LIST */}
      <FlatList
     
        data={filteredUsers}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.userRow}>
            <Text>{item.name}</Text>

             <Button
              title="Delete"
              color="red"
              onPress={() => handleDelete(item._id)}
            
            />
            <View style={{ gap: 6 }}>
                <Button
                    title={item.isActive ? "Disable" : "Enable"}
                    color={item.isActive ? "orange" : "green"}
                    onPress={() => toggleUserStatus(item._id).then(loadUsers)}
                />
                </View>
          </View>
          
        )}
      />
      
      <Button title="Go Back" onPress={() => router.push("../dashboard")} />
    </View>
  );
}

const styles = StyleSheet.create({
    pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    },
    counters: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
    },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, marginBottom: 12, textAlign: "center" },

  tabs: {
    flexDirection: "row",
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#ddd",
  },
  tabText: {
    fontWeight: "bold",
  },

  search: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },

  userRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  card: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
});
