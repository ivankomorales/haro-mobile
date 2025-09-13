const mongoose = require("mongoose");

// TTL index: remove logs after 180 days
const auditLogSchema = new mongoose.Schema({
  event: { type: String, required: true }, // e.g. "login_success", "order_updated"
  objectId: { type: mongoose.Schema.Types.ObjectId }, // affected Object (if any)
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // who did it
  description: { type: String }, // freeform: "Admin updated role for John Doe"
  ipAddress: { type: String }, // optional: from req.ip
  // objectType: {
  //   type: String,
  //   enum: ["Order", "Customer", "User", "Glaze", "Other"],
  //   default: "Other",
  //   index: true,
  // },
  logLevel: {
    type: String,
    enum: ["info", "warn", "error", "critical"],
    default: "info",
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: { expires: 15552000 }, // TTL index: delete after 180 days
  },
});

module.exports = mongoose.model("AuditLog", auditLogSchema);
