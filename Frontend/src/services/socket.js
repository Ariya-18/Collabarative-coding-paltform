import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
  autoConnect: true,
  transports: ["websocket"],
  auth: (cb) => {
    cb({ token: localStorage.getItem("token") });
  },
});

export default socket;