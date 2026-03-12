import api from "../config/clientAPI";

export const getProfile = async () => {
  const response = await api.get("/api/protected/profile");
  return response.data;
};

export const updateMyProfilePicture = async (profile: string) => {
  const response = await api.patch("/api/protected/profile/picture", { profile });
  return response.data;
};

