import api from "../config/clientAPI";

export const unassignSchedule = async (studentId: string, scheduleId: string) => {
  const res = await api.delete("/api/admin/schedule/unassign", {
    data: { studentId, scheduleId },
  });
  return res.data;
};

export const getStudentSchedule = async () => {
  const res = await api.get("/api/schedule/student");
  return res.data;
}

export const createSchedule = async (data: {
  courseId: string;
  facultyId: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
}) => {
  const res = await api.post("/api/admin/schedule", data);
  return res.data;
};

export const getCourses = async (page = 1, limit = 100) => {
  const res = await api.get("/api/courses", {
    params: { page, limit },
  });

  return Array.isArray(res.data) ? res.data : (res.data?.items || []);
};

export const getAdminSchedules = async (page = 1, limit = 100) => {
  const res = await api.get("/api/admin/schedules", {
    params: { page, limit },
  });

  return Array.isArray(res.data) ? res.data : (res.data?.items || []);
};

export const deleteSchedule = async (scheduleId: string) => {
  const res = await api.delete(`/api/admin/schedule/${scheduleId}`);
  return res.data;
};
