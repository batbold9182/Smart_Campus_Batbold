import api from "../config/clientAPI";

export const getProfile = async () => {
  const response = await api.get("/api/protected/profile");
  return response.data;
};

