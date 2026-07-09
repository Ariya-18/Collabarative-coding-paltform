const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["info", "room_invite", "interview_reminder", "system"],
      default: "info",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);