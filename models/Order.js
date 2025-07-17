const mongoose = require("mongoose");

const ProductItemSchema = new mongoose.Schema({
  type: String,
  quantity: Number, // 'figuras' → 'quantity' for generality
  price: Number,
  description: String,
  glazes: {
    interior: String,
    exterior: String,
  },
  decorations: {
    hasGold: Boolean,
    hasName: Boolean,
    decorationDescription: String,
  },
  images: [String], // URLs or file names
});

const OrderSchema = new mongoose.Schema(
  {
    orderID: { type: String, unique: true, required: true },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Cancelled"],
      default: "Pending",
    },
    deposit: { type: Number, default: 0 },
    shipping: {
      isRequired: { type: Boolean, default: false },
      address: String,
      city: String,
      zip: String,
      phone: String,
    },
    notes: String,
    products: {
      type: [ProductItemSchema],
      validate: [(arr) => arr.length > 0, "At least one product is required."],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
