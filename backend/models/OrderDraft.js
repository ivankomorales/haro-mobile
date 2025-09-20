// models/OrderDraft.js
const mongoose = require("mongoose");

const OrderDraftSchema = new mongoose.Schema(
  {
    // Who owns this draft (adjust type to match your user _id)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },

    // Optional human context (helps you debug/admin)
    label: { type: String },

    // The actual draft payload (store the UI-level fields you want to restore)
    data: {
      baseOrder: {
        customer: {
          name: String,
          lastName: String,
          email: String,
          phone: String,
          countryCode: String,
          socialMedia: mongoose.Schema.Types.Mixed,
        },
        orderDate: String, // keep as 'YYYY-MM-DD' UI string
        deliverDate: String, // same
        status: String,
        deposit: mongoose.Schema.Types.Mixed, // string/number ok
        notes: String,
        shipping: mongoose.Schema.Types.Mixed, // { isRequired, addresses[] } (UI shape)
      },
      products: [mongoose.Schema.Types.Mixed], // your UI product items
      productForm: mongoose.Schema.Types.Mixed, // the current product form (draft)
    },

    // Auto-expire old drafts
    expiresAt: { type: Date, index: { expireAfterSeconds: 0 } },
  },
  { timestamps: true }
);

// default TTL: 7 days from creation/update
OrderDraftSchema.pre("save", function (next) {
  const days = 7;
  const base = new Date();
  base.setDate(base.getDate() + days);
  this.expiresAt = base;
  next();
});

module.exports = mongoose.models.OrderDraft || mongoose.model("OrderDraft", OrderDraftSchema);
