const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    profilePicture: { type: String, default: "" },
    bio: { type: String, default: "" },
    skills: { type: [String], default: [] },
    role: { type: String, enum: ["user", "admin"], default: "user" },

    // Email verification
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationOTP: { type: String, select: false },
    emailVerificationExpire: { type: Date, select: false },

    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);