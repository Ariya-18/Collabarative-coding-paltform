const judge0Service = require("../services/judge0Service");
const Room = require("../models/Room");

const registerRoomSocket = (io, socket) => {
  socket.on("join-room", async ({ roomId, user }) => {
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.user = user;
    socket.to(roomId).emit("user-joined", { user });
  });

  socket.on("leave-room", ({ roomId, user }) => {
    socket.leave(roomId);
    socket.to(roomId).emit("user-left", { user });
  });

  socket.on("code-change", ({ roomId, code }) => {
    socket.to(roomId).emit("code-change", { code });
  });

  socket.on("cursor-change", ({ roomId, user, position }) => {
    socket.to(roomId).emit("cursor-change", { user, position });
  });

  socket.on("typing", ({ roomId, user }) => {
    socket.to(roomId).emit("typing", { user });
  });

  socket.on("stop-typing", ({ roomId, user }) => {
    socket.to(roomId).emit("stop-typing", { user });
  });

  // ── Code execution ──
  socket.on("run-code", async ({ roomId, code, language, input }) => {
    io.to(roomId).emit("execution-started");

    try {
      const result = await judge0Service.executeCode(code, language, input);
      io.to(roomId).emit("code-result", result);

      // Persist last run for this room (optional, but useful for history later)
      await Room.findOneAndUpdate({ roomId }, { code, output: result });
    } catch (error) {
      io.to(roomId).emit("code-result", {
        stdout: "",
        stderr: error.response?.data?.message || error.message,
        compileOutput: "",
        status: "Error",
      });
    }
  });

  socket.on("disconnect", () => {
    const { roomId, user } = socket.data || {};
    if (roomId && user) {
      socket.to(roomId).emit("user-left", { user });
    }
  });
};

module.exports = registerRoomSocket;