import axiosInstance from "./authService";

export const getNotifications = async () => {
  const { data } = await axiosInstance.get("/notifications");
  return data;
};

export const markNotificationAsRead = async (id) => {
  const { data } = await axiosInstance.put(`/notifications/${id}/read`);
  return data;
};

export const markAllNotificationsAsRead = async () => {
  const { data } = await axiosInstance.put("/notifications/read-all");
  return data;
};

export const deleteNotification = async (id) => {
  const { data } = await axiosInstance.delete(`/notifications/${id}`);
  return data;
};