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
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const { signupValidator, loginValidator } = require("../validators/authValidator");

const router = express.Router();

// Multer config for profile picture upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/profile/"),
  filename: (req, file, cb) => {
    cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
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
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/profile/picture", protect, upload.single("profilePicture"), updateProfilePicture);

module.exports = router;