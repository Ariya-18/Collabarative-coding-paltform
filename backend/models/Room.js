const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const roomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    title: {
      type: String,
      required: [true, "Room title is required"],
      trim: true,
      maxlength: 100,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        joinedAt: { type: Date, default: Date.now },
        leftAt: { type: Date, default: null },
      },
    ],
    language: {
      type: String,
      default: "javascript",
    },
    type: {
      type: String,
      enum: ["practice", "interview"],
      default: "practice",
    },
    status: {
      type: String,
      enum: ["scheduled", "active", "ended"],
      default: "active",
    },
    scheduledAt: { type: Date, default: null },
    startedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
    isPrivate: { type: Boolean, default: false },
    password: {
      type: String,
      default: null,
      select: false,
    },
    code: {
      type: String,
      default: "",
    },
    output: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

// Modern async/await style — no `next` callback parameter at all.
// Mongoose detects the returned Promise and waits for it automatically.
roomSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

roomSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Room", roomSchema);