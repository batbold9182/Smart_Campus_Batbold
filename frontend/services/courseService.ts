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

export const getAllCourses = async (page = 1, limit = 50) => {
  const res = await api.get("/api/courses", {
    params: { page, limit },
  });

  return Array.isArray(res.data) ? res.data : (res.data?.items || []);
};

export const assignCourse = async (courseId: string, facultyId: string) => {
  const res = await api.patch(`/api/courses/${courseId}/assign`, { facultyId });
  return res.data;
};

export const deleteCourse = async (courseId: string) => {
  const res = await api.delete(`/api/courses/${courseId}`);
  return res.data;
};
