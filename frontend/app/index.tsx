import { View, Text } from "react-native";
import { useEffect } from "react";
import http from "../config/http";

export default function Home() {
  useEffect(() => {
    http.get("/")
      .then(res => {
        console.log("Axios says:", res.data);
      })
      .catch(err => {
        console.error("Axios error:", err.message);
      });
  }, []);

  return (
    <View style={{ padding: 40 }}>
      <Text>Smart Campus Frontend</Text>
    </View>
  );
}
