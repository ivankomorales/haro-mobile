const express = require("express");
const router = express.Router();

// Controller
const { getAuditLogs } = require("../controllers/auditController");

// Middlewares
const { verifyToken, requireAdmin } = require("../middleware/auth");

//
// 🟢 GET ROUTES
//

// Get all audit logs (admin only)
router.get("/", verifyToken, requireAdmin, getAuditLogs);

module.exports = router;
