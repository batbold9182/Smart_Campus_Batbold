import api from "../config/clientAPI";

export type GradeRecord = {
  id: string;
  value: number;
  remarks: string;
  gradedAt: string;
  updatedAt: string;
};

export type FacultyGradeCourse = {
  id: string;
  title: string;
  code: string;
  credits: number;
  enrolledCount: number;
  gradedCount: number;
};

export type FacultyGradeStudent = {
  student: {
    id: string;
    name: string;
    email: string;
    program: string | null;
    yearLevel: number | null;
    studentId: string | null;
  };
  grade: GradeRecord | null;
};

export type FacultyGradeCourseDetail = {
  course: {
    id: string;
    title: string;
    code: string;
    credits: number;
  };
  students: FacultyGradeStudent[];
};

export type StudentGradeItem = {
  course: {
    id: string;
    title: string;
    code: string;
    credits: number;
    facultyName: string;
  };
  grade: GradeRecord | null;
};

export type StudentGradesResponse = {
  items: StudentGradeItem[];
  summary: {
    courseCount: number;
    gradedCount: number;
    averageGrade: number | null;
  };
};

export const getFacultyGradeCourses = async () => {
  const response = await api.get<{ courses: FacultyGradeCourse[] }>("/api/grades/faculty/courses");
  return response.data.courses;
};

export const getFacultyCourseGrades = async (courseId: string) => {
  const response = await api.get<FacultyGradeCourseDetail>(`/api/grades/faculty/courses/${courseId}/students`);
  return response.data;
};

export const saveStudentGrade = async (courseId: string, studentId: string, payload: { value: number; remarks?: string }) => {
  const response = await api.put(`/api/grades/faculty/courses/${courseId}/students/${studentId}`, payload);
  return response.data;
};

export const getStudentGrades = async () => {
  const response = await api.get<StudentGradesResponse>("/api/grades/student");
  return response.data;
};