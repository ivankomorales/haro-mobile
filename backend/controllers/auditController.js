const AuditLog = require("../models/AuditLog");

// ---------------------------------------------
// 🟢 GET AUDIT LOGS (GET /api/audit)
// ---------------------------------------------
const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find()
      .sort({ timestamp: -1 }) // Latest first
      .limit(100) // TODO: Add pagination or filters later
      .populate("objectId")
      .populate("performedBy", "name email");

    res.json(logs);
  } catch (err) {
    err.message = `Error retrieving audit logs: ${err.message}`;
    next(err);
  }
}; // end getAuditLogs

// ---------------------------------------------
// 📦 EXPORT CONTROLLER METHODS
// ---------------------------------------------
module.exports = {
  getAuditLogs,
};
