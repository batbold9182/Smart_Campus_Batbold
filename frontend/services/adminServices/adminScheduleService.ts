import api from "../../config/clientAPI";

export const assignSchedule = async (
  studentId: string,
  scheduleId: string
) => {
  const res = await api.post("/admin/assign-schedule", {
    studentId,
    scheduleId,
  });
  return res.data;
};

export const getStudents = async () => {
  const res = await api.get("/admin/students");
  return res.data;
};

export const getSchedules = async (page = 1, limit = 100) => {
  const res = await api.get("/admin/schedules", {
    params: { page, limit },
  });

  return Array.isArray(res.data) ? res.data : (res.data?.items || []);
};
