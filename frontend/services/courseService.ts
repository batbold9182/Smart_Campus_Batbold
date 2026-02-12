import api from "../config/clientAPI";

export const createCourse = async (data: {
  title: string;
  code: string;
  description?: string;
  credits?: number;
  facultyId: string;
}) => {
  const res = await api.post("/api/courses", data);
  return res.data;
};

export const getMyCourses = async () => {
  const res = await api.get("/api/courses/my");
  return res.data;
};

export const getAllCourses = async () => {
  const res = await api.get("/api/courses");
  return res.data;
};

export const assignCourse = async (courseId: string, facultyId: string) => {
  const res = await api.patch(`/api/courses/${courseId}/assign`, { facultyId });
  return res.data;
};

export const deleteCourse = async (courseId: string) => {
  const res = await api.delete(`/api/courses/${courseId}`);
  return res.data;
};
