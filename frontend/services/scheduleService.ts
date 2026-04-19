import api from "../config/clientAPI";

export type FacultyScheduleItem = {
  _id: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  course: {
    _id: string;
    title?: string;
    code?: string;
    name?: string;
  } | null;
};

export const unassignSchedule = async (studentId: string, scheduleId: string) => {
  const res = await api.delete("/admin/schedule/unassign", {
    data: { studentId, scheduleId },
  });
  return res.data;
};

export const getStudentSchedule = async (signal?: AbortSignal) => {
  const res = await api.get("/schedule/student", { signal });
  return res.data;
}

export const getFacultySchedule = async () => {
  const res = await api.get<FacultyScheduleItem[]>("/schedule/faculty");
  return Array.isArray(res.data) ? res.data : [];
};

export const createSchedule = async (data: {
  courseId: string;
  facultyId: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
}) => {
  const res = await api.post("/admin/schedule", data);
  return res.data;
};

export const getCourses = async (page = 1, limit = 100) => {
  const res = await api.get("/courses", {
    params: { page, limit },
  });

  return Array.isArray(res.data) ? res.data : (res.data?.items || []);
};

export const getAdminSchedules = async (page = 1, limit = 100, signal?: AbortSignal) => {
  const res = await api.get("/admin/schedules", {
    params: { page, limit },
    signal,
  });

  return Array.isArray(res.data) ? res.data : (res.data?.items || []);
};

export const deleteSchedule = async (scheduleId: string) => {
  const res = await api.delete(`/admin/schedule/${scheduleId}`);
  return res.data;
};
