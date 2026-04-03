import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
	getStudentAttendanceSummary,
	getStudentScheduleAttendance,
	type AttendanceStatus,
	type StudentAttendanceScheduleResponse,
	type StudentAttendanceSummaryResponse,
} from "../../services/facultyServices/attandanceService";

const toTodayDateKey = () => {
	const now = new Date();
	const year = now.getUTCFullYear();
	const month = String(now.getUTCMonth() + 1).padStart(2, "0");
	const day = String(now.getUTCDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

const isValidDateKey = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

const getBadgeClassName = (status: AttendanceStatus | null) => {
	if (status === "present") return "bg-green-100";
	if (status === "late") return "bg-amber-100";
	if (status === "excused") return "bg-blue-100";
	if (status === "absent") return "bg-red-100";
	return "bg-gray-100";
};

const formatStatusLabel = (status: AttendanceStatus | null) => {
	if (!status) return "Not marked";
	return status.charAt(0).toUpperCase() + status.slice(1);
};

export default function StudentAttendance() {
	const router = useRouter();
	const [selectedDate, setSelectedDate] = useState(toTodayDateKey());
	const [summaryData, setSummaryData] = useState<StudentAttendanceSummaryResponse | null>(null);
	const [scheduleData, setScheduleData] = useState<StudentAttendanceScheduleResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [reloadingSchedule, setReloadingSchedule] = useState(false);

	const loadSummary = async () => {
		const response = await getStudentAttendanceSummary();
		setSummaryData(response);
	};

	const loadSchedule = async (date: string) => {
		const response = await getStudentScheduleAttendance(date);
		setScheduleData(response);
		setSelectedDate(response.date);
	};

	useEffect(() => {
		const initialize = async () => {
			try {
				await Promise.all([loadSummary(), loadSchedule(selectedDate)]);
			} finally {
				setLoading(false);
			}
		};

		initialize();
	}, []);

	const handleReloadForDate = async () => {
		if (!isValidDateKey(selectedDate)) {
			return;
		}

		try {
			setReloadingSchedule(true);
			await loadSchedule(selectedDate);
		} finally {
			setReloadingSchedule(false);
		}
	};

	if (loading) {
		return (
			<SafeAreaView className="flex-1 items-center justify-center bg-[#f5f7fb]" edges={["top"]}>
				<ActivityIndicator size="large" color="#2563eb" />
				<Text className="mt-3 text-app-muted">Loading attendance...</Text>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-[#f5f7fb]" edges={["top"]}>
			<ScrollView className="flex-1 px-5" contentContainerClassName="pb-5">
				<Text className="mb-4 text-[22px] font-bold text-[#111827]">Attendance</Text>

				<View className="mb-4 flex-row justify-between gap-2">
					<View className="flex-1 rounded-xl bg-white p-4 shadow">
						<Text className="text-[20px] font-bold text-[#111827]">{summaryData?.summary.totalMarked || 0}</Text>
						<Text className="mt-1 text-[12px] text-app-muted">Marked Days</Text>
					</View>
					<View className="flex-1 rounded-xl bg-white p-4 shadow">
						<Text className="text-[20px] font-bold text-[#111827]">{summaryData?.summary.presentCount || 0}</Text>
						<Text className="mt-1 text-[12px] text-app-muted">Present</Text>
					</View>
					<View className="flex-1 rounded-xl bg-white p-4 shadow">
						<Text className="text-[20px] font-bold text-[#111827]">{summaryData?.summary.absentCount || 0}</Text>
						<Text className="mt-1 text-[12px] text-app-muted">Absent</Text>
					</View>
				</View>

				<View className="mb-4 rounded-xl bg-white p-4 shadow">
					<Text className="mb-2 text-[16px] font-semibold text-[#111827]">Check By Date</Text>
					<TextInput
						value={selectedDate}
						onChangeText={setSelectedDate}
						placeholder="YYYY-MM-DD"
						className="rounded-lg border border-[#d1d5db] px-4 py-3 text-[#111827]"
						autoCapitalize="none"
						autoCorrect={false}
					/>
					<TouchableOpacity
						className={`mt-3 items-center rounded-lg p-[14px] ${isValidDateKey(selectedDate) ? "bg-blue-500" : "bg-[#9ca3af]"}`}
						onPress={handleReloadForDate}
						disabled={!isValidDateKey(selectedDate) || reloadingSchedule}
					>
						<Text className="font-semibold text-white">{reloadingSchedule ? "Loading..." : "Load Attendance For Date"}</Text>
					</TouchableOpacity>
				</View>

				<View className="mb-4 rounded-xl bg-white p-4 shadow">
					<Text className="mb-2 text-[16px] font-semibold text-[#111827]">
						Schedule Attendance{scheduleData?.day ? ` • ${scheduleData.day}` : ""}
					</Text>

					{!scheduleData?.items.length ? (
						<Text className="text-app-muted">No scheduled classes found for this date.</Text>
					) : (
						scheduleData.items.map((item) => (
							<View key={item.schedule.id} className="mb-3 rounded-lg border border-[#e5e7eb] p-4 last:mb-0">
								<View className="flex-row items-start justify-between gap-3">
									<View className="flex-1">
										<Text className="text-[15px] font-semibold text-[#111827]">{item.course?.title || "Untitled Course"}</Text>
										<Text className="mt-1 text-app-muted">
											{item.course?.code || "No code"} • {item.schedule.startTime} - {item.schedule.endTime}
										</Text>
										<Text className="mt-1 text-[#9ca3af]">Room {item.schedule.room} • Faculty: {item.facultyName}</Text>
									</View>
									<View className={`rounded-full px-3 py-2 ${getBadgeClassName(item.attendance?.status || null)}`}>
										<Text className="text-[12px] font-semibold text-[#1f2937]">
											{formatStatusLabel(item.attendance?.status || null)}
										</Text>
									</View>
								</View>

								{item.attendance?.remarks ? (
									<View className="mt-3 rounded-lg bg-[#f9fafb] p-3">
										<Text className="text-[12px] font-semibold uppercase tracking-[0.5px] text-app-muted">Remarks</Text>
										<Text className="mt-2 text-[#374151]">{item.attendance.remarks}</Text>
									</View>
								) : null}
							</View>
						))
					)}
				</View>

				<View className="mb-4 rounded-xl bg-white p-4 shadow">
					<Text className="mb-2 text-[16px] font-semibold text-[#111827]">Course Attendance Summary</Text>

					{!summaryData?.items.length ? (
						<Text className="text-app-muted">Attendance records will appear here after faculty mark them.</Text>
					) : (
						summaryData.items.map((item) => (
							<View key={item.course.id} className="mb-3 rounded-lg border border-[#e5e7eb] p-4 last:mb-0">
								<View className="flex-row items-start justify-between gap-3">
									<View className="flex-1">
										<Text className="text-[15px] font-semibold text-[#111827]">{item.course.title}</Text>
										<Text className="mt-1 text-app-muted">{item.course.code} • Faculty: {item.course.facultyName}</Text>
									</View>
									<View className="rounded-full bg-[#eff6ff] px-3 py-2">
										<Text className="text-[12px] font-semibold text-[#1d4ed8]">{item.summary.totalMarked} records</Text>
									</View>
								</View>

								<View className="mt-3 flex-row flex-wrap gap-2">
									<View className="rounded-full bg-green-100 px-3 py-2">
										<Text className="text-[12px] font-semibold text-[#166534]">Present {item.summary.presentCount}</Text>
									</View>
									<View className="rounded-full bg-red-100 px-3 py-2">
										<Text className="text-[12px] font-semibold text-[#991b1b]">Absent {item.summary.absentCount}</Text>
									</View>
									<View className="rounded-full bg-amber-100 px-3 py-2">
										<Text className="text-[12px] font-semibold text-[#92400e]">Late {item.summary.lateCount}</Text>
									</View>
									<View className="rounded-full bg-blue-100 px-3 py-2">
										<Text className="text-[12px] font-semibold text-[#1d4ed8]">Excused {item.summary.excusedCount}</Text>
									</View>
								</View>

								{item.latestAttendance ? (
									<Text className="mt-3 text-[12px] text-app-muted">
										Latest record: {formatStatusLabel(item.latestAttendance.status)} on {item.latestAttendance.date}
									</Text>
								) : (
									<Text className="mt-3 text-[12px] text-[#9ca3af]">No attendance marked yet</Text>
								)}
							</View>
						))
					)}
				</View>

				<TouchableOpacity
					className="items-center rounded-lg bg-blue-500 p-[14px]"
					onPress={() => router.push("/student/dashboard")}
				>
					<Text className="font-semibold text-white">Back to Dashboard</Text>
				</TouchableOpacity>
			</ScrollView>
		</SafeAreaView>
	);
}
