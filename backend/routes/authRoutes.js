const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  updateProfilePicture,
  verifyEmail,
  resendOTP,
  changePassword,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const { signupValidator, loginValidator } = require("../validators/authValidator");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/profile/"),
  filename: (req, file, cb) => {
    cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    if (ext) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

router.post("/signup", signupValidator, signup);
router.post("/login", loginValidator, login);
router.post("/logout", protect, logout);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOTP);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/profile/picture", protect, upload.single("profilePicture"), updateProfilePicture);
router.put("/change-password", protect, changePassword);

module.exports = router;