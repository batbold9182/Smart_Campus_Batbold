import api from "../config/clientAPI";

export const createCourse = async (data: {
  title: string;
  code: string;
  description?: string;
  credits?: number;
  facultyId: string;
}) => {
  const res = await api.post("/courses", data);
  return res.data;
};

export const getMyCourses = async () => {
  const res = await api.get("/courses/my");
  return res.data;
};

export const getAllCourses = async (page = 1, limit = 50) => {
  const res = await api.get("/courses", {
    params: { page, limit },
  });

  return Array.isArray(res.data) ? res.data : (res.data?.items || []);
};

export const assignCourse = async (courseId: string, facultyId: string) => {
  const res = await api.patch(`/courses/${courseId}/assign`, { facultyId });
  return res.data;
};

export const deleteCourse = async (courseId: string) => {
  const res = await api.delete(`/courses/${courseId}`);
  return res.data;
};
