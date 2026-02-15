import api from "../config/clientAPI";

export const getUnreadCount = async () => {
  const res = await api.get("/api/notifications/unread-count");
  return res.data;
};