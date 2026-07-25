const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { generateOTP, hashOTP } = require("../utils/generateOTP");
const sendEmail = require("../utils/sendEmail");

// @desc  Register new user — sends OTP, does NOT log in yet
// @route POST /api/auth/signup
exports.signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const { otp, hashedOTP } = generateOTP();

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      emailVerificationOTP: hashedOTP,
      emailVerificationExpire: Date.now() + 10 * 60 * 1000, // 10 mins
    });

    await sendEmail({
      to: user.email,
      subject: "Verify your CodeShare account",
      text: `Your verification code is ${otp}. It expires in 10 minutes.`,
    });

    res.status(201).json({
      message: "Account created. Check your email for the verification code.",
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Verify email with OTP — logs user in on success
// @route POST /api/auth/verify-email
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email }).select(
      "+emailVerificationOTP +emailVerificationExpire"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }
    if (!user.emailVerificationOTP || user.emailVerificationExpire < Date.now()) {
      return res.status(400).json({ message: "OTP expired. Please request a new one." });
    }
    if (hashOTP(otp) !== user.emailVerificationOTP) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isEmailVerified: true,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Resend OTP
// @route POST /api/auth/resend-otp
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const { otp, hashedOTP } = generateOTP();
    user.emailVerificationOTP = hashedOTP;
    user.emailVerificationExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Your new CodeShare verification code",
      text: `Your new verification code is ${otp}. It expires in 10 minutes.`,
    });

    res.status(200).json({ message: "A new OTP has been sent to your email" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Login user
// @route POST /api/auth/login
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
        email: user.email,
        requiresVerification: true,
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Logout user
// @route POST /api/auth/logout
exports.logout = async (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
};

// @desc  Forgot password - generate reset token
// @route POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No user with that email" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins

    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    res.status(200).json({
      message: "Password reset link generated",
      resetUrl, // remove this in production, send via email instead
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Reset password
// @route PUT /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get logged-in user profile
// @route GET /api/auth/profile
exports.getProfile = async (req, res) => {
  res.status(200).json(req.user);
};

// @desc  Update profile
// @route PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, skills } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.bio = bio ?? user.bio;
    user.skills = skills || user.skills;

    await user.save();

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Upload profile picture
// @route PUT /api/auth/profile/picture
exports.updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user._id);
    user.profilePicture = `/uploads/profile/${req.file.filename}`;
    await user.save();

    res.status(200).json({ profilePicture: user.profilePicture });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Change password (used from Settings page)
// @route PUT /api/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};