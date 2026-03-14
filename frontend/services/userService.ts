import api from "../config/clientAPI";

export type AppUserProfile = {
  _id?: string;
  name: string;
  email: string;
  role: "admin" | "faculty" | "student";
  isActive?: boolean;
  profile?: string;
  school?: string | null;
  department?: string | null;
  title?: string | null;
  employeeId?: string | null;
  studentId?: string | null;
  program?: string | null;
  yearLevel?: number | null;
};

export type UpdateProfilePictureResponse = {
  message: string;
  profile: string;
};

export const getProfile = async () => {
  const response = await api.get<AppUserProfile>("/api/protected/profile");
  return response.data;
};

export const updateMyProfilePicture = async (profile: string) => {
  const response = await api.patch<UpdateProfilePictureResponse>("/api/protected/profile/picture", { profile });
  return response.data;
};

