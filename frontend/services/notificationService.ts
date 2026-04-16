import api from "../config/clientAPI";

export const getUnreadCount = async (signal?: AbortSignal) => {
  const res = await api.get("/api/notifications/unread-count", { signal });
  return res.data;
};

export const getNotifications = async (page = 1, limit = 5) => {
  const res = await api.get("/api/notifications", { params: { page, limit } });
  return res.data;
};

export const markNotificationRead = async (id: string) => {
  const res = await api.patch(`/api/notifications/${id}/read`);
  return res.data;
};

export const getUsersByRole = async (role: "student" | "faculty", limit = 1000) => {
  const res = await api.get(`/api/admin/users?role=${role}&page=1&limit=${limit}`);
  return res.data;
};

export const sendNotification = async (payload: {
  title: string;
  message: string;
  target?: string;
  userId?: string;
  recipients?: string[];
  type?: string;
}) => {
  const res = await api.post("/api/admin/notify", payload);
  return res.data;
};