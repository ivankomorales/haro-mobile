const mongoose = require("mongoose");

const GlazeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  hex: { type: String, required: true },
  image: { type: String },
});

module.exports = mongoose.model("Glaze", GlazeSchema);
