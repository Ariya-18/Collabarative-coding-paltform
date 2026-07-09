import axiosInstance from "./authService";

export const createRoom = async (roomData) => {
  const { data } = await axiosInstance.post("/rooms/create", roomData);
  return data;
};

export const joinRoom = async (joinData) => {
  const { data } = await axiosInstance.post("/rooms/join", joinData);
  return data;
};

export const getMySessions = async () => {
  const { data } = await axiosInstance.get("/rooms/my-sessions");
  return data;
};

export const getUpcomingInterviews = async () => {
  const { data } = await axiosInstance.get("/rooms/upcoming");
  return data;
};

export const getRoomById = async (roomId) => {
  const { data } = await axiosInstance.get(`/rooms/${roomId}`);
  return data;
};