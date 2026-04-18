import { View, Text } from "react-native";

type Summary = {
  courseCount: number;
  assignmentCount: number;
  dueTodayCount: number;
  upcomingCount: number;
  submittedCount: number;
  pendingCount: number;
  overdueCount: number;
};

type Props = {
  summary: Summary;
};

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <View className="flex-1 rounded-xl bg-app-surface p-4 shadow-card">
      <Text className="text-[20px] font-bold text-app-text">{value}</Text>
      <Text className="mt-1 text-[12px] text-app-muted">{label}</Text>
    </View>
  );
}

export default function StatsCards({ summary }: Props) {
  return (
    <>
      <View className="mb-4 flex-row justify-between gap-2">
        <StatCard value={summary.courseCount} label="Courses" />
        <StatCard value={summary.assignmentCount} label="Assignments" />
        <StatCard value={summary.dueTodayCount} label="Due Today" />
      </View>
      <View className="mb-4 flex-row justify-between gap-2">
        <StatCard value={summary.upcomingCount} label="Upcoming" />
        <StatCard value={summary.submittedCount} label="Submitted" />
      </View>
      <View className="mb-4 flex-row justify-between gap-2">
        <StatCard value={summary.pendingCount} label="Pending" />
        <StatCard value={summary.overdueCount} label="Overdue" />
      </View>
    </>
  );
}
