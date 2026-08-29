const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const registerRoomHandlers = require("./roomSocket");

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  // Authenticate Socket.IO connection using JWT
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Not authorized, no token"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;

      next();
    } catch (error) {
      console.error("Socket authentication error:", error.message);
      next(new Error("Not authorized, token failed"));
    }
  });

  // Socket connection
  io.on("connection", (socket) => {
    console.log(
      `🔌 Socket connected: ${socket.user.name} (${socket.id})`
    );

    // Register room-related socket events
    registerRoomHandlers(io, socket);

    // Handle disconnect
    socket.on("disconnect", (reason) => {
      console.log(
        `❌ Socket disconnected: ${socket.user.name} (${reason})`
      );
    });
  });

  return io;
};

module.exports = initSocket;