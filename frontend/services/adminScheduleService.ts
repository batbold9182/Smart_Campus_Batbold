import api from "../config/clientAPI";

export const assignSchedule = async (
  studentId: string,
  scheduleId: string
) => {
  const res = await api.post("/api/admin/assign-schedule", {
    studentId,
    scheduleId,
  });
  return res.data;
};

export const getStudents = async () => {
  const res = await api.get("/api/admin/students");
  return res.data;
};

export const getSchedules = async () => {
  const res = await api.get("/api/admin/schedules");
  return res.data;
};
