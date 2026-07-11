import API from "./authService";

export const createRoom = (data) => API.post("/rooms/create", data);
export const joinRoom = (data) => API.post("/rooms/join", data);
export const getMySessions = () => API.get("/rooms/my-sessions");
export const getUpcomingInterviews = () => API.get("/rooms/upcoming");
export const getRoomById = (roomId) => API.get(`/rooms/${roomId}`);