const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: String,
    email: String,
    instagram: String,
    address: String,
    city: String,
    zip: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", CustomerSchema);
