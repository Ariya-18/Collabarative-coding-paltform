const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const registerRoomHandlers = require("./roomSocket");

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  // Auth middleware — expects JWT in socket.handshake.auth.token
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Not authorized, no token"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Not authorized, token failed"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.user.name} (${socket.id})`);
    registerRoomHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.user.name}`);
    });
  });

  return io;
};

module.exports = initSocket;