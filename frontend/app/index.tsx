import { useEffect, useState } from "react";
import { Text, View, ActivityIndicator, StyleSheet } from "react-native";
import API_URL from "../config/api";

export default function Home() {
  const [status, setStatus] = useState("Checking backend...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.text())
      .then(text => {
        setStatus(text + " ✅");
        setLoading(false);
      })
      .catch(() => {
        setStatus("❌ Cannot connect to backend");
        setLoading(false);
      });
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Text style={styles.text}>{status}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    textAlign: "center",
  },
});
