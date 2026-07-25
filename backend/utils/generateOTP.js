const crypto = require("crypto");

const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
  return { otp, hashedOTP };
};

const hashOTP = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

module.exports = { generateOTP, hashOTP };