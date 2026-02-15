import api from "../config/clientAPI";

export const getStudentSchedule = async () => {
  const res = await api.get("/api/schedule/student");
  return res.data;
};

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

export const getCourses = async () => {
  const res = await api.get("/api/courses");
  return res.data;
};
