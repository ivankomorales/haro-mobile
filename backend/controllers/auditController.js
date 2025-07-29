const AuditLog = require("../models/AuditLog");

const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find()
      .sort({ timestamp: -1 })
      .limit(100) // We can paginate in the future
      .populate("objectId")
      .populate("performedBy", "name email");

    res.json(logs);
  } catch (err) {
    err.message = `Error retrieving audit logs: ${err.message}`;
    next(err);
  }
};

module.exports = { getAuditLogs };
