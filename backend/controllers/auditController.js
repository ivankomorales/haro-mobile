const AuditLog = require("../models/AuditLog");

const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .sort({ timestamp: -1 })
      .limit(100) // We can paginate in the future
      .populate("objectId")
      .populate("performedBy", "name email");

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Error retrieving audit logs" });
  }
};

module.exports = { getAuditLogs };
