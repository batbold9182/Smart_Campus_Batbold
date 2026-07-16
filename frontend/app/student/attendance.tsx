import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import ScreenLayout from "../../components/ScreenLayout";
import { SkeletonStatRow, SkeletonList } from "../../components/Skeleton";
import { AppButton, AppInput } from "../../components/ui";
import Toast from "react-native-toast-message";
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
	if (status === "present") return "bg-app-success-bg";
	if (status === "late") return "bg-app-warning-bg";
	if (status === "excused") return "bg-app-primary-bg";
	if (status === "absent") return "bg-app-error-bg";
	return "bg-app-bg-muted";
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
	const [error, setError] = useState("");

	const loadSummary = async () => {
		const response = await getStudentAttendanceSummary();
		setSummaryData(response);
	};

	const loadSchedule = async (date: string) => {
		const response = await getStudentScheduleAttendance(date);
		setScheduleData(response);
		setSelectedDate(response.date);
	};

	const loadAll = async (date: string) => {
		try {
			setLoading(true);
			setError("");
			await Promise.all([loadSummary(), loadSchedule(date)]);
		} catch {
			setError("Failed to load attendance. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		// Initial load only — Retry and the date button handle refreshes.
		loadAll(selectedDate);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleReloadForDate = async () => {
		if (!isValidDateKey(selectedDate)) {
			return;
		}

		try {
			setReloadingSchedule(true);
			await loadSchedule(selectedDate);
		} catch {
			Toast.show({
				type: "error",
				text1: "Failed to load attendance for that date",
				text2: "Please try again.",
			});
		} finally {
			setReloadingSchedule(false);
		}
	};

	if (loading) {
		return (
			<ScreenLayout title="Attendance" backRoute="/student/dashboard">
				<SkeletonStatRow count={3} />
				<SkeletonList rows={3} />
			</ScreenLayout>
		);
	}

	if (error) {
		return (
			<ScreenLayout title="Attendance" backRoute="/student/dashboard">
				<View className="mb-3 rounded-xl bg-app-surface p-4 shadow-card">
					<Text className="mb-3 text-center text-app-error">{error}</Text>
					<AppButton onPress={() => loadAll(selectedDate)}>Retry</AppButton>
				</View>
			</ScreenLayout>
		);
	}

	return (
		<ScreenLayout title="Attendance" backRoute="/student/dashboard">

				<View className="mb-4 flex-row justify-between gap-2">
					<View className="flex-1 rounded-xl bg-app-surface p-4 shadow-card">
						<Text className="text-app-lg font-bold text-app-text">{summaryData?.summary.totalMarked || 0}</Text>
						<Text className="mt-1 text-app-xs text-app-muted">Marked Days</Text>
					</View>
					<View className="flex-1 rounded-xl bg-app-surface p-4 shadow-card">
						<Text className="text-app-lg font-bold text-app-text">{summaryData?.summary.presentCount || 0}</Text>
						<Text className="mt-1 text-app-xs text-app-muted">Present</Text>
					</View>
					<View className="flex-1 rounded-xl bg-app-surface p-4 shadow-card">
						<Text className="text-app-lg font-bold text-app-text">{summaryData?.summary.absentCount || 0}</Text>
						<Text className="mt-1 text-app-xs text-app-muted">Absent</Text>
					</View>
				</View>

				<View className="mb-4 rounded-xl bg-app-surface p-4 shadow-card">
					<Text className="mb-2 text-app-base font-semibold text-app-text">Check By Date</Text>
					<AppInput
						value={selectedDate}
						onChangeText={setSelectedDate}
						placeholder="YYYY-MM-DD"
							autoCapitalize="none"
						autoCorrect={false}
					/>
					<AppButton
						title="Load Attendance For Date"
						loading={reloadingSchedule}
						disabled={!isValidDateKey(selectedDate)}
						onPress={handleReloadForDate}
					/>
				</View>

				<View className="mb-4 rounded-xl bg-app-surface p-4 shadow-card">
					<Text className="mb-2 text-app-base font-semibold text-app-text">
						Schedule Attendance{scheduleData?.day ? ` • ${scheduleData.day}` : ""}
					</Text>

					{!scheduleData?.items.length ? (
						<Text className="text-app-muted">No scheduled classes found for this date.</Text>
					) : (
						scheduleData.items.map((item) => (
							<View key={item.schedule.id} className="mb-3 rounded-lg border border-app-border-light p-4 last:mb-0">
								<View className="flex-row items-start justify-between gap-3">
									<View className="flex-1">
										<Text className="text-app-base font-semibold text-app-text">{item.course?.title || "Untitled Course"}</Text>
										<Text className="mt-1 text-app-muted">
											{item.course?.code || "No code"} • {item.schedule.startTime} - {item.schedule.endTime}
										</Text>
										<Text className="mt-1 text-app-placeholder">Room {item.schedule.room} • Faculty: {item.facultyName}</Text>
									</View>
									<View className={`rounded-full px-3 py-2 ${getBadgeClassName(item.attendance?.status || null)}`}>
										<Text className="text-app-xs font-semibold text-app-text">
											{formatStatusLabel(item.attendance?.status || null)}
										</Text>
									</View>
								</View>

								{item.attendance?.remarks ? (
									<View className="mt-3 rounded-lg bg-app-bg-subtle p-3">
										<Text className="text-app-xs font-semibold uppercase tracking-[0.5px] text-app-muted">Remarks</Text>
										<Text className="mt-2 text-app-text-secondary">{item.attendance.remarks}</Text>
									</View>
								) : null}
							</View>
						))
					)}
				</View>

				<View className="mb-4 rounded-xl bg-app-surface p-4 shadow-card">
					<Text className="mb-2 text-app-base font-semibold text-app-text">Course Attendance Summary</Text>

					{!summaryData?.items.length ? (
						<Text className="text-app-muted">Attendance records will appear here after faculty mark them.</Text>
					) : (
						summaryData.items.map((item) => (
							<View key={item.course.id} className="mb-3 rounded-lg border border-app-border-light p-4 last:mb-0">
								<View className="flex-row items-start justify-between gap-3">
									<View className="flex-1">
										<Text className="text-app-base font-semibold text-app-text">{item.course.title}</Text>
										<Text className="mt-1 text-app-muted">{item.course.code} • Faculty: {item.course.facultyName}</Text>
									</View>
									<View className="rounded-full bg-app-primary-bg px-3 py-2">
										<Text className="text-app-xs font-semibold text-app-primary-dark">{item.summary.totalMarked} records</Text>
									</View>
								</View>

								<View className="mt-3 flex-row flex-wrap gap-2">
									<View className="rounded-full bg-app-success-bg px-3 py-2">
										<Text className="text-app-xs font-semibold text-app-success-dark">Present {item.summary.presentCount}</Text>
									</View>
									<View className="rounded-full bg-app-error-bg px-3 py-2">
										<Text className="text-app-xs font-semibold text-app-error-dark">Absent {item.summary.absentCount}</Text>
									</View>
									<View className="rounded-full bg-app-warning-bg px-3 py-2">
										<Text className="text-app-xs font-semibold text-app-warning-dark">Late {item.summary.lateCount}</Text>
									</View>
									<View className="rounded-full bg-app-primary-bg px-3 py-2">
										<Text className="text-app-xs font-semibold text-app-primary-dark">Excused {item.summary.excusedCount}</Text>
									</View>
								</View>

								{item.latestAttendance ? (
									<Text className="mt-3 text-app-xs text-app-muted">
										Latest record: {formatStatusLabel(item.latestAttendance.status)} on {item.latestAttendance.date}
									</Text>
								) : (
									<Text className="mt-3 text-app-xs text-app-placeholder">No attendance marked yet</Text>
								)}
							</View>
						))
					)}
				</View>

				<AppButton onPress={() => router.push("/student/dashboard")}>
					Back to Dashboard
				</AppButton>
		</ScreenLayout>
	);
}
