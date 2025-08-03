const express = require("express");
const router = express.Router();

// Controller
const { createUser } = require("../controllers/userController");

// Middlewares
const { verifyToken } = require("../middleware/auth");
const checkRole = require("../middleware/checkRole"); // Optional: rename file to match English naming
const { body } = require("express-validator");

//
// 🟠 POST ROUTES
//

// Create a new user (admin only)
router.post(
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
