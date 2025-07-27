const express = require("express");
const router = express.Router();
const {
  createGlaze,
  getGlazeById,
  getGlazes,
  updateGlaze,
  deactivateGlaze,
} = require("../controllers/glazeController");

const { verifyToken, requireAdmin } = require("../middleware/auth");

router.get("/:id", verifyToken, getGlazeById);
router.get("/", verifyToken, getGlazes);
router.post("/", verifyToken, requireAdmin, createGlaze);
router.put("/:id", verifyToken, requireAdmin, updateGlaze);
router.patch("/:id/deactivate", verifyToken, requireAdmin, deactivateGlaze);

module.exports = router;
