const requireVerified = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      message: "Please verify your email before creating or joining a room",
      requiresVerification: true,
      email: req.user.email,
    });
  }
  next();
};

module.exports = { requireVerified };