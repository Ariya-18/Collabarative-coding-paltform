const Room = require("../models/Room");
const { executeCode } = require("../services/judge0Service");

// In-memory presence: roomId -> Map(socketId -> { userId, name, profilePicture })
const roomParticipants = new Map();

// Debounced DB writes for code: roomId -> timeoutId
const saveTimers = new Map();

const getParticipants = (roomId) => {
  const map = roomParticipants.get(roomId);
  return map ? Array.from(map.values()) : [];
};

const debouncedSaveCode = (roomId, code) => {
  if (saveTimers.has(roomId)) clearTimeout(saveTimers.get(roomId));
  const timer = setTimeout(async () => {
    try {
      await Room.findOneAndUpdate({ roomId }, { code });
    } catch (err) {
      console.error("Failed to save room code:", err.message);
    }
    saveTimers.delete(roomId);
  }, 1500);
  saveTimers.set(roomId, timer);
};

const registerRoomHandlers = (io, socket) => {
  const user = socket.user;

  const leaveRoom = (roomId) => {
    const map = roomParticipants.get(roomId);
    if (map) {
      map.delete(socket.id);
      if (map.size === 0) roomParticipants.delete(roomId);
    }
    socket.leave(roomId);
    socket.to(roomId).emit("user-left", {
      name: user.name,
      participants: getParticipants(roomId),
    });
  };

  socket.on("join-room", async ({ roomId }) => {
    try {
      const room = await Room.findOne({ roomId: roomId.toUpperCase() });
      if (!room) {
        socket.emit("room-error", { message: "Room not found" });
        return;
      }

      socket.join(roomId);
      socket.data.roomId = roomId;

      if (!roomParticipants.has(roomId)) roomParticipants.set(roomId, new Map());
      roomParticipants.get(roomId).set(socket.id, {
        userId: user._id.toString(),
        name: user.name,
        profilePicture: user.profilePicture,
      });

      socket.emit("room-state", {
        code: room.code || "",
        language: room.language,
        participants: getParticipants(roomId),
      });

      socket.to(roomId).emit("user-joined", {
        name: user.name,
        participants: getParticipants(roomId),
      });
    } catch (error) {
      socket.emit("room-error", { message: "Failed to join room" });
    }
  });

  socket.on("code-change", ({ roomId, code }) => {
    if (!roomId) return;
    socket.to(roomId).emit("code-update", { code });
    debouncedSaveCode(roomId, code);
  });

  socket.on("language-change", async ({ roomId, language }) => {
    if (!roomId) return;
    socket.to(roomId).emit("language-update", { language });
    try {
      await Room.findOneAndUpdate({ roomId }, { language });
    } catch (err) {
      console.error("Failed to save language:", err.message);
    }
  });

  socket.on("run-code", async ({ roomId, code, language }) => {
    if (!roomId) return;
    io.to(roomId).emit("run-started", { by: user.name });

    try {
      const result = await executeCode(language, code);
      io.to(roomId).emit("run-result", { ...result, by: user.name });
      await Room.findOneAndUpdate({ roomId }, { output: result });
    } catch (error) {
      io.to(roomId).emit("run-result", {
        status: "Error",
        stderr: error.message,
        stdout: null,
        compile_output: null,
        by: user.name,
      });
    }
  });

  socket.on("leave-room", ({ roomId }) => leaveRoom(roomId));

  socket.on("disconnect", () => {
    const roomId = socket.data.roomId;
    if (roomId) leaveRoom(roomId);
  });
};

module.exports = registerRoomHandlers;