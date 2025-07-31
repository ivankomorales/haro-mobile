const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    lastName: { type: String },
    phone: String,
    email: String,
    socialMedia: {
      instagram: String,
      facebook: String, // Optional
      // tiktok: String, // We can add more later
    },
    address: String,
    city: String,
    zip: String,
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", CustomerSchema);
