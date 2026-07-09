import axiosInstance from "./authService";

export const getDashboardStats = async () => {
  const { data } = await axiosInstance.get("/dashboard/stats");
  return data;
};