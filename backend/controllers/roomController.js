const Room = require("../models/Room");
const Notification = require("../models/Notification");
const generateRoomId = require("../utils/generateRoomId");
const { validationResult } = require("express-validator");

// @desc Create a new room
// @route POST /api/rooms/create
exports.createRoom = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, type, language, isPrivate, password, scheduledAt } = req.body;

    let roomId;
    let exists = true;
    while (exists) {
      roomId = generateRoomId();
      exists = await Room.findOne({ roomId });
    }

    const room = await Room.create({
      roomId,
      title,
      host: req.user._id,
      type: type || "practice",
      language: language || "javascript",
      isPrivate: isPrivate || false,
      password: isPrivate ? password : undefined,
      scheduledAt: scheduledAt || null,
      status: scheduledAt ? "scheduled" : "active",
      startedAt: scheduledAt ? null : new Date(),
      participants: [{ user: req.user._id }],
    });

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: {
        roomId: room.roomId,
        title: room.title,
        type: room.type,
        status: room.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Join a room
// @route POST /api/rooms/join
exports.joinRoom = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { roomId, password } = req.body;
    const room = await Room.findOne({ roomId: roomId.toUpperCase() }).select("+password");

    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    if (room.status === "ended") {
      return res.status(400).json({ success: false, message: "This room has ended" });
    }

    if (room.isPrivate) {
      if (!password) {
        return res.status(400).json({ success: false, message: "Password required" });
      }
      const isMatch = await room.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Incorrect password" });
      }
    }

    const alreadyJoined = room.participants.some(
      (p) => p.user.toString() === req.user._id.toString() && !p.leftAt
    );

    if (!alreadyJoined) {
      room.participants.push({ user: req.user._id });
      if (room.status === "scheduled") room.status = "active";
      await room.save();
    }

    res.status(200).json({
      success: true,
      message: "Joined room successfully",
      data: { roomId: room.roomId, title: room.title },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get logged-in user's recent sessions
// @route GET /api/rooms/my-sessions
exports.getMySessions = async (req, res, next) => {
  try {
    const rooms = await Room.find({
      $or: [{ host: req.user._id }, { "participants.user": req.user._id }],
      status: { $in: ["active", "ended"] },
    })
      .populate("host", "name profilePicture")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({ success: true, data: rooms });
  } catch (error) {
    next(error);
  }
};

// @desc Get upcoming scheduled interviews
// @route GET /api/rooms/upcoming
exports.getUpcomingInterviews = async (req, res, next) => {
  try {
    const rooms = await Room.find({
      $or: [{ host: req.user._id }, { "participants.user": req.user._id }],
      status: "scheduled",
      scheduledAt: { $gte: new Date() },
    })
      .populate("host", "name profilePicture")
      .sort({ scheduledAt: 1 });

    res.status(200).json({ success: true, data: rooms });
  } catch (error) {
    next(error);
  }
};

// @desc Get single room details
// @route GET /api/rooms/:roomId
exports.getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId.toUpperCase() })
      .populate("host", "name profilePicture")
      .populate("participants.user", "name profilePicture");

    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    res.status(200).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};