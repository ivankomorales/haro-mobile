const express = require("express");
const router = express.Router();

// Controller
const {
  createUser,
  getMe,
  updateMe,
} = require("../controllers/userController");

// Middlewares

const { verifyToken } = require("../middleware/auth");
const checkRole = require("../middleware/checkRole"); // Optional: rename file to match English naming
const { body } = require("express-validator");

//
// 🟢 GET ROUTES
//
router.get("/me", verifyToken, getMe);

//
// 🔵 UPDATE ROUTES
//
router.patch(
  "/me",
  verifyToken,
  // validaciones mínimas si quieres (opcionales)
  [
    body("email").optional().isEmail().withMessage("Invalid email"),
    body("name").optional().isString(),
    body("lastName").optional().isString(),
    body("avatarUrl").optional().isString(),
  ],
  updateMe
);

//
// 🟠 POST ROUTES
//
router.post(
  // Create a new user (admin only)
  "/",
  verifyToken,
  checkRole("admin"),
  [
    body("name", "Name is required").notEmpty(),
    body("email", "Invalid email").isEmail(),
    body("password", "Password must be at least 6 characters").isLength({
      min: 6,
    }),
    body("role").optional().isIn(["admin", "employee"]),
  ],
  createUser
);
module.exports = router;
