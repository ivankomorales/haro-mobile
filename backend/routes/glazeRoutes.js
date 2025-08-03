const express = require("express");
const router = express.Router();

// Controller
const {
  createGlaze,
  getGlazeById,
  getGlazes,
  updateGlaze,
  deactivateGlaze,
} = require("../controllers/glazeController");

// Middlewares
const { verifyToken, requireAdmin } = require("../middleware/auth");

//
// 🟢 GET ROUTES
//

// Get all glazes
router.get("/", verifyToken, getGlazes);

// Get a glaze by ID
router.get("/:id", verifyToken, getGlazeById);

//
// 🟠 POST ROUTES
//

// Create a new glaze (admin only)
router.post("/", verifyToken, requireAdmin, createGlaze);

//
// 🔵 PUT ROUTES
//

// Update glaze data (admin only)
router.put("/:id", verifyToken, requireAdmin, updateGlaze);

//
// 🟣 PATCH ROUTES
//

// Deactivate a glaze (admin only)
router.patch("/:id/deactivate", verifyToken, requireAdmin, deactivateGlaze);

module.exports = router;
