const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { requireVerified } = require("../middlewares/verifiedMiddleware");
const {
  createRoom,
  joinRoom,
  getMySessions,
  getUpcomingInterviews,
  getRoomById,
  inviteToRoom,
  getRoomExecutions,
  getRoomMessages,
} = require("../controllers/roomController");
const { createRoomValidator, joinRoomValidator } = require("../validators/roomValidator");

router.post("/create", protect, requireVerified, createRoomValidator, createRoom);
router.post("/join", protect, requireVerified, joinRoomValidator, joinRoom);
router.get("/my-sessions", protect, getMySessions);
router.get("/upcoming", protect, getUpcomingInterviews);
router.get("/:roomId", protect, getRoomById);
router.post("/:roomId/invite", protect, requireVerified, inviteToRoom);
router.get("/:roomId/executions", protect, getRoomExecutions);
router.get("/:roomId/messages", protect, getRoomMessages);

module.exports = router;