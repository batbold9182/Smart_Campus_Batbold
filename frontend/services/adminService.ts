import api from "../config/clientAPI";

export const createFaculty = async (
  name: string,
  email: string,
  password: string
) => {
  const res = await api.post("/api/admin/create-faculty", {
    name,
    email,
    password,
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
