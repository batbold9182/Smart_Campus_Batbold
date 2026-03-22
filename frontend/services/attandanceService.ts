import api from "../config/clientAPI";

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export type AttendanceRecord = {
	id: string;
	status: AttendanceStatus;
	remarks: string;
	date: string;
	markedAt: string;
	updatedAt: string;
};

export type FacultyAttendanceCourse = {
	id: string;
	title: string;
	code: string;
	credits: number;
	enrolledCount: number;
	markedTodayCount: number;
};

export type FacultyAttendanceStudent = {
	student: {
		id: string;
		name: string;
		email: string;
		program: string | null;
		yearLevel: number | null;
		studentId: string | null;
	};
	attendance: AttendanceRecord | null;
};

export type FacultyAttendanceCourseDetail = {
	course: {
		id: string;
		title: string;
		code: string;
		credits: number;
	};
	date: string;
	students: FacultyAttendanceStudent[];
};

export type StudentAttendanceSummaryItem = {
	course: {
		id: string;
		title: string;
		code: string;
		credits: number;
		facultyName: string;
	};
	summary: {
		presentCount: number;
		absentCount: number;
		lateCount: number;
		excusedCount: number;
		totalMarked: number;
	};
	latestAttendance: AttendanceRecord | null;
};

export type StudentAttendanceSummaryResponse = {
	items: StudentAttendanceSummaryItem[];
	summary: {
		courseCount: number;
		totalMarked: number;
		presentCount: number;
		absentCount: number;
		lateCount: number;
		excusedCount: number;
	};
};

export type StudentAttendanceScheduleItem = {
	schedule: {
		id: string;
		day: string;
		startTime: string;
		endTime: string;
		room: string;
	};
	course: {
		id: string;
		title: string;
		code: string;
		credits: number | null;
	} | null;
	facultyName: string;
	attendance: AttendanceRecord | null;
};

export type StudentAttendanceScheduleResponse = {
	date: string;
	day: string;
	items: StudentAttendanceScheduleItem[];
};

export const getFacultyAttendanceCourses = async () => {
	const response = await api.get<{ courses: FacultyAttendanceCourse[] }>("/api/attendance/faculty/courses");
	return response.data.courses;
};

export const getFacultyCourseAttendance = async (courseId: string, date: string) => {
	const response = await api.get<FacultyAttendanceCourseDetail>(
		`/api/attendance/faculty/courses/${courseId}/students`,
		{
			params: { date },
		}
	);
	return response.data;
};

export const saveStudentAttendance = async (
	courseId: string,
	studentId: string,
	payload: { status: AttendanceStatus; date: string; remarks?: string }
) => {
	const response = await api.put(`/api/attendance/faculty/courses/${courseId}/students/${studentId}`, payload);
	return response.data;
};

export const getStudentAttendanceSummary = async () => {
	const response = await api.get<StudentAttendanceSummaryResponse>("/api/attendance/student/summary");
	return response.data;
};

export const getStudentScheduleAttendance = async (date: string) => {
	const response = await api.get<StudentAttendanceScheduleResponse>("/api/attendance/student/schedule", {
		params: { date },
	});
	return response.data;
};
