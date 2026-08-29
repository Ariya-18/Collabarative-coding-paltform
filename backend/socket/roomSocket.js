const judge0Service = require("../services/judge0Service");
const Room = require("../models/Room");
const Execution = require("../models/Execution");
const Message = require("../models/Message");

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

      // Create history log entry
      const execution = await Execution.create({
        roomId: roomId.toUpperCase(),
        user: socket.user._id,
        code,
        language,
        input,
        output: result,
      });

      // Populate user info so clients know who triggered it
      const populatedExecution = await execution.populate("user", "name email");

      // Broadcast history update to the entire room in real-time
      io.to(roomId).emit("new-execution", populatedExecution);

      // Persist last run for this room
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

  // ── Chat messaging ──
  socket.on("send-message", async ({ roomId, text }) => {
    try {
      const msg = await Message.create({
        roomId: roomId.toUpperCase(),
        user: socket.user._id,
        text,
      });

      const populatedMsg = await msg.populate("user", "name email profilePicture");
      io.to(roomId).emit("new-message", populatedMsg);
    } catch (error) {
      console.error("Error broadcasting message:", error.message);
    }
  });

  socket.on("chat-typing", ({ roomId, user }) => {
    socket.to(roomId).emit("chat-typing", { user });
  });

  socket.on("chat-stop-typing", ({ roomId, user }) => {
    socket.to(roomId).emit("chat-stop-typing", { user });
  });

  socket.on("disconnect", () => {
    const { roomId, user } = socket.data || {};
    if (roomId && user) {
      socket.to(roomId).emit("user-left", { user });
    }
  });
};

module.exports = registerRoomSocket;