import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
export default function AdminSchedule() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Schedule Management</Text>
      <Text>Here you can manage schedules and assign them to students.</Text>
    </View>
  );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,

        padding: 20,
    },
    title: {

        fontSize: 24,

        fontWeight: "bold",
        marginBottom: 12,
    },
});
