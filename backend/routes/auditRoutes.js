const express = require("express");
const router = express.Router();
const { getAuditLogs } = require("../controllers/auditController");
const { verifyToken, requireAdmin } = require("../middleware/auth");

router.get("/", verifyToken, requireAdmin, getAuditLogs);

module.exports = router;
