import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet ,Button} from "react-native";
import { getStudentSchedule } from "../../services/scheduleService";
import { useRouter } from "expo-router";
export default function StudentScheduleScreen() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const data = await getStudentSchedule();
      setSchedule(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📅 My Schedule</Text>
      <Button title="Back to dashboard" onPress={() => router.push("../dashboard")} />

      {loading ? (
        <Text style={styles.loading}>Loading schedule...</Text>
      ) : schedule.length === 0 ? (
        <Text style={styles.empty}>No schedule assigned yet</Text>
      ) : (
        <FlatList
          data={schedule}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.course}>{item.course?.title || item.course?.name || "Untitled Course"}</Text>
              <Text>Day: {item.day}</Text>
              <Text>Time: {item.startTime} – {item.endTime}</Text>
              <Text>Room: {item.room}</Text>
            </View>
          )}
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  card: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  course: { fontSize: 16, fontWeight: "bold" },
  loading: { marginTop: 50, textAlign: "center" },
  empty: { marginTop: 50, textAlign: "center" },
});
