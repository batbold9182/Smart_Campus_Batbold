import api from "../../config/clientAPI";
import { getToken } from "../tokenStorage";

export type FacultyAssignmentCourse = {
  id: string;
  title: string;
  code: string;
  credits: number;
  enrolledCount: number;
  assignmentCount: number;
};

export type AssignmentRecord = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxPoints: number;
  createdAt: string;
  updatedAt: string;
  submissionCount?: number;
  reviewedCount?: number;
  submission?: AssignmentSubmissionRecord | null;
};

export type AssignmentSubmissionRecord = {
  id: string;
  notes: string;
  fileUrl: string | null;
  fileName: string | null;
  fileType: string | null;
  fileSize: number | null;
  submittedAt: string;
  score: number | null;
  feedback: string;
  reviewedAt: string | null;
  updatedAt: string;
};

export type FacultyAssignmentSubmissionRecord = AssignmentSubmissionRecord & {
  student: {
    id: string;
    name: string;
    email: string;
    program: string | null;
    yearLevel: number | null;
    studentId: string | null;
  };
};

export type FacultyAssignmentCourseDetail = {
  course: {
    id: string;
    title: string;
    code: string;
    credits: number;
  };
  assignments: AssignmentRecord[];
};

export type FacultyAssignmentSubmissionDetail = {
  assignment: AssignmentRecord;
  submissions: FacultyAssignmentSubmissionRecord[];
};

export type StudentAssignmentItem = {
  course: {
    id: string;
    title: string;
    code: string;
    credits: number;
    facultyName: string;
  };
  assignments: AssignmentRecord[];
};

export type StudentAssignmentsResponse = {
  items: StudentAssignmentItem[];
  summary: {
    courseCount: number;
    assignmentCount: number;
    upcomingCount: number;
    dueTodayCount: number;
    overdueCount: number;
    submittedCount: number;
    pendingCount: number;
  };
};

export const getFacultyAssignmentCourses = async () => {
  const response = await api.get<{ courses: FacultyAssignmentCourse[] }>("/assignments/faculty/courses");
  return response.data.courses;
};

export const getFacultyCourseAssignments = async (courseId: string) => {
  const response = await api.get<FacultyAssignmentCourseDetail>(`/assignments/faculty/courses/${courseId}/assignments`);
  return response.data;
};

export const createCourseAssignment = async (
  courseId: string,
  payload: { title: string; description?: string; dueDate: string; maxPoints: number }
) => {
  const response = await api.post(`/assignments/faculty/courses/${courseId}/assignments`, payload);
  return response.data;
};

export const deleteCourseAssignment = async (assignmentId: string) => {
  const response = await api.delete(`/assignments/${assignmentId}`);
  return response.data;
};

export const getStudentAssignments = async () => {
  const response = await api.get<StudentAssignmentsResponse>("/assignments/student");
  return response.data;
};

export const getFacultyAssignmentSubmissions = async (courseId: string, assignmentId: string) => {
  const response = await api.get<FacultyAssignmentSubmissionDetail>(
    `/assignments/faculty/courses/${courseId}/assignments/${assignmentId}/submissions`
  );
  return response.data;
};

export const saveFacultyAssignmentReview = async (
  assignmentId: string,
  submissionId: string,
  payload: { score?: number | null; feedback?: string }
) => {
  const response = await api.put(
    `/assignments/faculty/assignments/${assignmentId}/submissions/${submissionId}/review`,
    payload
  );
  return response.data;
};

export const submitStudentAssignment = async (assignmentId: string, payload: FormData) => {
  const response = await api.post(`/assignments/student/assignments/${assignmentId}/submission`, payload);

  return response.data;
};

export const downloadAssignmentSubmission = async (submissionId: string) => {
  const response = await api.get(`/assignments/submissions/${submissionId}/download`, {
    responseType: "blob",
  });

  return response.data as Blob;
};

export const getAssignmentSubmissionDownloadUrl = async (submissionId: string) => {
  const token = await getToken();
  const baseUrl = (api.defaults.baseURL || "").replace(/\/$/, "");
  return `${baseUrl}/assignments/submissions/${submissionId}/download?token=${encodeURIComponent(token || "")}`;
};