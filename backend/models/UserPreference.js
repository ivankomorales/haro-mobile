// models/UserPreference.js
const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },
    namespace: { type: String, required: true }, // e.g. "excel.fields", "ui.theme", "i18n.lang"
    key: { type: String, required: true, default: "_" }, // reserved for sub-keys if needed
    value: { type: mongoose.Schema.Types.Mixed, required: true }, // arbitrary JSON
  },
  { timestamps: true }
);

schema.index({ user: 1, namespace: 1, key: 1 }, { unique: true });

module.exports = mongoose.model("UserPreference", schema);
