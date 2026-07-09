import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const signupApi = (data) => API.post("/auth/signup", data);
export const loginApi = (data) => API.post("/auth/login", data);
export const logoutApi = () => API.post("/auth/logout");
export const forgotPasswordApi = (email) =>
  API.post("/auth/forgot-password", { email });
export const resetPasswordApi = (token, password) =>
  API.put(`/auth/reset-password/${token}`, { password });
export const getProfileApi = () => API.get("/auth/profile");
export const updateProfileApi = (data) => API.put("/auth/profile", data);
export const updateProfilePictureApi = (formData) =>
  API.put("/auth/profile/picture", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export default API;