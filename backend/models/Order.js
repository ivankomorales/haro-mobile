const mongoose = require("mongoose");

const ProductItemSchema = new mongoose.Schema({
  type: String,
  quantity: Number, // 'figuras' → 'quantity' for generality
  price: Number,
  description: String,
  glazes: {
    interior: { type: mongoose.Schema.Types.ObjectId, ref: "Glaze" },
    exterior: { type: mongoose.Schema.Types.ObjectId, ref: "Glaze" },
  },
  decorations: {
    hasGold: Boolean,
    hasName: Boolean,
    decorationDescription: String,
  },
  images: [String], // URLs or file names
  workflowStage: {
    type: String,
    enum: [
      "exported", // blue
      "sculptedPainted", // yellow
      "urgent", // red
      "painting", // pink
      "delivered", // green
    ],
    default: null,
  },
  assignedShippingIndex: { type: Number, default: null }, // Array index shipping.addresses
});

const OrderSchema = new mongoose.Schema(
  {
    orderID: { type: String, unique: true, required: true },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

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
      addresses: [
        {
          address: String,
          city: String,
          zip: String,
          phone: String,
        },
      ],
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
