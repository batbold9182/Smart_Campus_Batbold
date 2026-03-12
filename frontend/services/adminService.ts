import api from "../config/clientAPI";
export const unenrollStudent = async (enrollmentId: string) => {
  const res = await api.delete(`/api/admin/enrollments/${enrollmentId}`);
  return res.data;
}
export const createFaculty = async (
  name: string,
  email: string,
  password: string,
  role: "faculty" | "student" = "faculty",
  profile?: {
    school?: string;
    department?: string;
    title?: string;
    profile?: string;
    studentId?: string;
    program?: string;
    yearLevel?: number;
  }
) => {
  const res = await api.post("/api/admin/create-faculty", {
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
    `/api/admin/users?page=${page}&limit=${limit}${role ? `&role=${role}` : ""}`
  );
  return res.data;
};

export const deleteUser = async (id: string) => {
  const res = await api.delete(`/api/admin/users/${id}`);
  return res.data;
};

export const toggleUserStatus = async (id: string) => {
    const res = await api.patch(`/api/admin/users/${id}/toggle`);
    return res.data;
};

export const getAcademicOptions = async () => {
  const res = await api.get("/api/admin/academic-options");
  return res.data;
};
