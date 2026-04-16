/**
 * Shared TypeScript interfaces that mirror backend response DTOs.
 * Import these in service files and components instead of using `any`.
 */

// ─── Auth ───────────────────────────────────────────────────────────────────

export interface UserPayload {
  id: string;
  role: "admin" | "faculty" | "student";
  exp: number;
}

// ─── Users ──────────────────────────────────────────────────────────────────

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "faculty" | "student";
  profile: string;
  isActive: boolean;
  school?: string | null;
  department?: string | null;
  title?: string | null;
  employeeId?: string | null;
  studentId?: string | null;
  program?: string | null;
  yearLevel?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedUsers {
  users: UserProfile[];
  pagination: {
    page: number;
    totalPages: number;
  };
  counters?: {
    faculty: number;
    students: number;
    disabled: number;
  };
}

// ─── Courses ─────────────────────────────────────────────────────────────────

export interface Course {
  _id: string;
  title: string;
  code: string;
  credits?: number;
  faculty?: {
    _id: string;
    name: string;
    email: string;
  } | null;
}

// ─── Schedule ────────────────────────────────────────────────────────────────

export interface ScheduleItem {
  _id: string;
  day: string;
  startTime: string;
  endTime: string;
  room?: string;
  course: { _id: string; title: string; code: string; credits?: number } | null;
  faculty?: { _id: string; name: string; email: string } | null;
}

// ─── Grades ──────────────────────────────────────────────────────────────────

export interface Grade {
  id: string;
  value: number;
  remarks: string;
  gradedAt: string;
  updatedAt: string;
}

export interface StudentGradeItem {
  course: {
    id: string;
    title: string;
    code: string;
    credits?: number;
    facultyName: string;
  };
  grade: Grade | null;
}

// ─── Assignments ─────────────────────────────────────────────────────────────

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
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
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface PaginatedNotifications {
  items: NotificationItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export interface AttendanceRecord {
  id: string;
  scheduleId: string | null;
  status: "present" | "absent" | "late" | "excused";
  remarks: string;
  date: string;
  markedAt: string;
  updatedAt: string;
}

// ─── Pagination (generic) ─────────────────────────────────────────────────────

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
