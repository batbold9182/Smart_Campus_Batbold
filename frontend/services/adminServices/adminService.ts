import api from "../../config/clientAPI";

export const getEnrollments = async (page = 1, limit = 20) => {
  const res = await api.get("/admin/enrollments", { params: { page, limit } });
  return res.data;
};

export const enrollStudent = async (studentId: string, courseId: string) => {
  const res = await api.post("/admin/enroll", { studentId, courseId });
  return res.data;
};

export const unenrollStudent = async (enrollmentId: string) => {
  const res = await api.delete(`/admin/enrollments/${enrollmentId}`);
  return res.data;
}
export const createUser = async (
  name: string,
  email: string,
  password: string,
  role: "faculty" | "student" = "faculty",
  profile?: {
    school?: string;
    department?: string;
    title?: string;
    employeeId?: string;
    profile?: string;
    studentId?: string;
    program?: string;
    yearLevel?: number;
  }
) => {
  const res = await api.post("/admin/create-faculty", {
    name,
    email,
    password,
    role,
    ...(profile || {}),
  });
  return res.data;
};

export const getUsers = async (page = 1, role?: string, limit = 5) => {
  const res = await api.get(
    `/admin/users?page=${page}&limit=${limit}${role ? `&role=${role}` : ""}`
  );
  return res.data;
};

export const deleteUser = async (id: string) => {
  const res = await api.delete(`/admin/users/${id}`);
  return res.data;
};

export const toggleUserStatus = async (id: string) => {
    const res = await api.patch(`/admin/users/${id}/toggle`);
    return res.data;
};

export const getAcademicOptions = async (signal?: AbortSignal) => {
  const res = await api.get("/admin/academic-options", { signal });
  return res.data;
};

export const updateUser = async (id: string, updates: any) => {
  const res = await api.patch(`/admin/users/${id}`, updates);
  return res.data;
};
