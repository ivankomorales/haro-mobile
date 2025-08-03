const express = require("express");
const router = express.Router();

// Controller
const { login } = require("../controllers/authController");

//
// 🟠 POST ROUTES
//

// User login
router.post("/login", login);

module.exports = router;
