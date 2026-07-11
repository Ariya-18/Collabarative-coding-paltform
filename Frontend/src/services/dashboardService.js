import API from "./authService";

export const getDashboardStats = () => API.get("/dashboard/stats");