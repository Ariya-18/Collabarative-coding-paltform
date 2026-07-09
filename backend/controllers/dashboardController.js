const Room = require("../models/Room");

// @desc Get dashboard statistics for logged-in user
// @route GET /api/dashboard/stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const totalRooms = await Room.countDocuments({
      $or: [{ host: userId }, { "participants.user": userId }],
    });

    const totalHosted = await Room.countDocuments({ host: userId });

    const totalInterviews = await Room.countDocuments({
      $or: [{ host: userId }, { "participants.user": userId }],
      type: "interview",
    });

    const activeRooms = await Room.countDocuments({
      $or: [{ host: userId }, { "participants.user": userId }],
      status: "active",
    });

    const completedSessions = await Room.countDocuments({
      $or: [{ host: userId }, { "participants.user": userId }],
      status: "ended",
    });

    res.status(200).json({
      success: true,
      data: {
        totalRooms,
        totalHosted,
        totalInterviews,
        activeRooms,
        completedSessions,
      },
    });
  } catch (error) {
    next(error);
  }
};