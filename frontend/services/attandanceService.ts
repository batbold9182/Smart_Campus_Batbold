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
