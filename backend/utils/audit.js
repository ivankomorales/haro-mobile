const AuditLog = require("../models/AuditLog");

/**
 * Logs an audit event with optional user info and IP.
 * @param {Object} options
 * @param {String} options.event - Action type (e.g., 'login_success')
 * @param {String} [options.objectId] - Affected Object (i.e. User, Order, Glaze if any)
 * @param {String} [options.description] - Free-form description
 * @param {String} [options.logLevel='info'] - Log severity
 * @param {Object} [req] - Express request to extract IP and performedBy
 */
const logEvent = async ({
  event,
  objectId,
  description,
  logLevel = "info",
  req,
}) => {
  try {
    const performedBy = req?.user?._id || undefined;
    const ipAddress = req?.ip || undefined;

    await AuditLog.create({
      event,
      objectId,
      performedBy,
      ipAddress,
      description,
      logLevel,
    });
  } catch (err) {
    console.error("AuditLog error:", err.message);
  }
};

module.exports = { logEvent };
