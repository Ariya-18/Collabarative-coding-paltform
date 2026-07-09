const { body } = require("express-validator");

exports.createRoomValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Room title is required")
    .isLength({ max: 100 })
    .withMessage("Title too long"),
  body("type")
    .optional()
    .isIn(["practice", "interview"])
    .withMessage("Invalid room type"),
  body("language").optional().isString(),
  body("isPrivate").optional().isBoolean(),
  body("password")
    .if(body("isPrivate").equals(true))
    .notEmpty()
    .withMessage("Password required for private room"),
  body("scheduledAt").optional().isISO8601().withMessage("Invalid date"),
];

exports.joinRoomValidator = [
  body("roomId").trim().notEmpty().withMessage("Room ID is required"),
  body("password").optional().isString(),
];