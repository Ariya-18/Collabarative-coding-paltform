const Room = require("../models/Room");
const generateRoomId = require("../utils/generateRoomId");
const sendEmail = require("../utils/sendEmail");

// @desc  Create a new room
// @route POST /api/rooms/create
exports.createRoom = async (req, res) => {
  try {
    const { title, type, language, isPrivate, password, scheduledAt } = req.body;

    let roomId;
    let exists = true;
    // Keep generating until we get a roomId that isn't already taken
    while (exists) {
      roomId = generateRoomId();
      exists = await Room.findOne({ roomId });
    }

    const room = await Room.create({
      roomId,
      title,
      host: req.user._id,
      participants: [{ user: req.user._id }],
      language: language || "javascript",
      type: type || "practice",
      status: scheduledAt ? "scheduled" : "active",
      scheduledAt: scheduledAt || null,
      startedAt: scheduledAt ? null : new Date(),
      isPrivate: !!isPrivate,
      password: isPrivate ? password : undefined,
    });

    res.status(201).json({
      ...room.toObject(),
      password: undefined,
      inviteLink: `${process.env.CLIENT_URL}/join/${room.roomId}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Join an existing room
// @route POST /api/rooms/join
exports.joinRoom = async (req, res) => {
  try {
    const { roomId, password } = req.body;

    const room = await Room.findOne({ roomId: roomId.toUpperCase() }).select("+password");
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (room.isPrivate) {
      if (!password) {
        return res.status(400).json({ message: "This room requires a password" });
      }
      const isMatch = await room.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: "Incorrect room password" });
      }
    }

    const alreadyIn = room.participants.some(
      (p) => p.user.toString() === req.user._id.toString() && !p.leftAt
    );
    if (!alreadyIn) {
      room.participants.push({ user: req.user._id });
      await room.save();
    }

    res.status(200).json({ roomId: room.roomId, title: room.title });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get rooms the user has hosted or joined
// @route GET /api/rooms/my-sessions
exports.getMySessions = async (req, res) => {
  try {
    const rooms = await Room.find({
      $or: [{ host: req.user._id }, { "participants.user": req.user._id }],
    })
      .sort({ updatedAt: -1 })
      .limit(20)
      .populate("host", "name email profilePicture");

    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get upcoming scheduled interviews for the user
// @route GET /api/rooms/upcoming
exports.getUpcomingInterviews = async (req, res) => {
  try {
    const rooms = await Room.find({
      $or: [{ host: req.user._id }, { "participants.user": req.user._id }],
      type: "interview",
      status: "scheduled",
      scheduledAt: { $gte: new Date() },
    })
      .sort({ scheduledAt: 1 })
      .populate("host", "name email profilePicture");

    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get a single room by its roomId
// @route GET /api/rooms/:roomId
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId.toUpperCase() }).populate(
      "host",
      "name email profilePicture"
    );

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Email an invite link to join a room
// @route POST /api/rooms/:roomId/invite
exports.inviteToRoom = async (req, res) => {
  try {
    const { email } = req.body;
    const room = await Room.findOne({ roomId: req.params.roomId.toUpperCase() });
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const inviteLink = `${process.env.CLIENT_URL}/join/${room.roomId}`;

    await sendEmail({
      to: email,
      subject: `You're invited to join "${room.title}" on CodeShare`,
      text: `Join the room here: ${inviteLink}\nRoom ID: ${room.roomId}`,
      html: `<p><b>${req.user.name}</b> invited you to a CodeShare session: <b>${room.title}</b></p>
             <p><a href="${inviteLink}">Click here to join</a></p>
             <p>Room ID: <b>${room.roomId}</b></p>`,
    });

    res.status(200).json({ message: "Invite sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};