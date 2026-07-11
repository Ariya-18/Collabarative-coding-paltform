import API from "./authService";

export const getNotifications = () => API.get("/notifications");
export const markNotificationAsRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllNotificationsAsRead = () => API.put("/notifications/read-all");
export const deleteNotification = (id) => API.delete(`/notifications/${id}`);