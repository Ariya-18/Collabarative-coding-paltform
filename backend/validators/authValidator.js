const { body } = require("express-validator");
const { domainCanReceiveEmail } = require("../utils/verifyDomain");

exports.signupValidator = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email")
    .isEmail().withMessage("Valid email is required")
    .custom(async (email) => {
      const ok = await domainCanReceiveEmail(email);
      if (!ok) throw new Error("This email domain doesn't appear to accept mail");
      return true;
    }),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

exports.loginValidator = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];