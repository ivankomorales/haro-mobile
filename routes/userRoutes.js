const express = require("express");
const router = express.Router();
const { createUser } = require("../controllers/userController");
const { verifyToken } = require("../middleware/auth"); // <-- renombrado aquí
const checkRole = require("../middleware/checkRole"); // <-- opcional: renombra archivo a inglés si gustas
const { body } = require("express-validator");

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
