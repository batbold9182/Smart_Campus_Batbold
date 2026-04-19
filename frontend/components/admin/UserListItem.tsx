import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

type Props = {
  item: any;
  activeTab: "faculty" | "student";
  expandedUserId: string | null;
  onToggle: (id: string) => void;
  onEdit: (item: any) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function UserListItem({
  item,
  activeTab,
  expandedUserId,
  onToggle,
  onEdit,
  onToggleStatus,
  onDelete,
}: Props) {
  const isExpanded = expandedUserId === item._id;

  return (
    <View className="mb-3 rounded-xl border border-app-border bg-app-surface p-3">
      <TouchableOpacity activeOpacity={0.8} onPress={() => onToggle(item._id)}>
        <Text className="mb-1 text-[16px] font-semibold text-app-text">{item.name}</Text>
        <Text className="mb-1 text-[13px] text-app-muted">{item.email}</Text>
        {activeTab === "faculty" ? (
          <View className="mb-2 gap-1">
            <Text className="text-[12px] text-app-text-secondary">School: {item.school || "-"}</Text>
            <Text className="text-[12px] text-app-text-secondary">Department: {item.department || "-"}</Text>
            <Text className="text-[12px] text-app-text-secondary">Title: {item.title || "-"}</Text>
            <Text className="text-[12px] text-app-text-secondary">Employee ID: {item.employeeId || "-"}</Text>
          </View>
        ) : (
          <View className="mb-2 gap-1">
            <Text className="text-[12px] text-app-text-secondary">Program: {item.program || "-"}</Text>
            <Text className="text-[12px] text-app-text-secondary">Year: {item.yearLevel || "-"}</Text>
            <Text className="text-[12px] text-app-text-secondary">Student ID: {item.studentId || "-"}</Text>
          </View>
        )}
        <Text className="mb-2 text-[12px] font-medium text-app-primary">
          {isExpanded ? "Hide actions" : "Show actions"}
        </Text>
      </TouchableOpacity>

      {isExpanded ? (
        <View className="gap-[6px]">
          <TouchableOpacity
            className="items-center rounded-lg bg-app-primary px-3 py-3"
            onPress={() => onEdit(item)}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${item.name}`}
          >
            <Text className="font-semibold text-white">Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`items-center rounded-lg px-3 py-3 ${item.isActive ? "bg-app-warning" : "bg-app-success-accent"}`}
            onPress={() => onToggleStatus(item._id)}
            accessibilityRole="button"
            accessibilityLabel={item.isActive ? `Disable ${item.name}` : `Enable ${item.name}`}
          >
            <Text className="font-semibold text-white">{item.isActive ? "Disable" : "Enable"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="items-center rounded-lg bg-app-danger px-3 py-3"
            onPress={() => onDelete(item._id)}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${item.name}`}
          >
            <Text className="font-semibold text-white">Delete</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}
