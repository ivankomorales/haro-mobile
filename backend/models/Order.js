const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    alt: { type: String, trim: true },
    // Cloudinary metadata you already get on upload:
    publicId: { type: String, trim: true },
    width: { type: Number },
    height: { type: Number },
    format: { type: String, trim: true },
    bytes: { type: Number },
    primary: { type: Boolean, default: false },
  },
  { _id: true }
);

const ProductItemSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, trim: true }, // or enum/ref later
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true },

    // Both refs and denormalized cache for easy display/export
    glazes: {
      interior: { type: mongoose.Schema.Types.ObjectId, ref: "Glaze" },
      exterior: { type: mongoose.Schema.Types.ObjectId, ref: "Glaze" },
      interiorName: { type: String, trim: true },
      interiorHex: { type: String, trim: true }, // "#RRGGBB" or "RRGGBB"
      exteriorName: { type: String, trim: true },
      exteriorHex: { type: String, trim: true },
    },

    decorations: {
      hasGold: { type: Boolean, default: false },
      hasName: { type: Boolean, default: false },
      decorationDescription: { type: String, trim: true },
    },

    images: { type: [ImageSchema], default: [] },

    workflowStage: {
      type: String,
      enum: ["none", "exported", "sculpted_painted", "painting", "delivered"],
      default: "none",
      index: true,
    },
  },
  { _id: true }
);

const AddressSchema = new mongoose.Schema(
  {
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    zip: { type: String, required: true, trim: true, match: /^[0-9]{5}$/ },
    phone: { type: String, required: true, trim: true, match: /^[0-9]{10}$/ },
  },
  { _id: true }
);
const CANONICAL = ["new", "pending", "inProgress", "completed", "cancelled"];
const OrderSchema = new mongoose.Schema(
  {
    orderID: { type: String, unique: true, required: true, trim: true },
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

    orderDate: { type: Date, default: Date.now, index: true },

    status: {
      type: String,
      enum: CANONICAL,
      default: "new",
      index: true,
    },

    deliverDate: {
      type: Date,
      default: function () {
        const base = this.orderDate ? new Date(this.orderDate) : new Date();
        base.setDate(base.getDate() + 35); // 5 weeks
        return base;
      },
    },

    // Deposit as whole pesos (integers)
    deposit: { type: Number, default: 0, min: 0 },

    shipping: {
      isRequired: { type: Boolean, default: false },
      addresses: { type: [AddressSchema], default: [] },
      selectedAddressId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },
      selected: { type: AddressSchema, default: undefined }, // optional snapshot
    },

    // Urgency (separate from workflow)
    isUrgentManual: { type: Boolean, default: false },
    isUrgentAuto: { type: Boolean, default: false },
    isUrgent: { type: Boolean, default: false, index: true },

    notes: { type: String, trim: true },

    products: {
      type: [ProductItemSchema],
      validate: [(arr) => arr.length > 0, "At least one product is required."],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: "throw",
  }
);

// Normalize legacy variants on set (safety net)
OrderSchema.path("status").set((v) => {
  if (!v) return v;
  const map = {
    New: "new",
    Pending: "pending",
    "In Progress": "inProgress",
    in_progress: "inProgress",
    Completed: "completed",
    Cancelled: "cancelled",
  };
  const s = String(v);
  if (CANONICAL.includes(s)) return s;
  if (map[s]) return map[s];
  const clean = s.toLowerCase().replace(/[-_ ]+/g, "");
  if (clean === "inprogress") return "inProgress";
  if (clean === "new") return "new";
  if (clean === "pending") return "pending";
  if (clean === "completed") return "completed";
  if (clean === "cancelled") return "cancelled";
  throw new Error(`Invalid status: ${v}`);
});

// Useful indexes
// 1) List orders by customer and show the most recent first
//    Example: Order.find({ customer }).sort({ orderDate: -1 })
OrderSchema.index({ customer: 1, orderDate: -1 });

// 2) Dashboards by status (new/pending/...) prioritizing recent orders
//    Example: Order.find({ status }).sort({ orderDate: -1 })
OrderSchema.index({ status: 1, orderDate: -1 });

// 3) Urgent orders, sorted by deliverDate (soonest first)
//    Example: Order.find({ isUrgent: true }).sort({ deliverDate: 1 })
OrderSchema.index({ isUrgent: 1, deliverDate: 1 });

// 4) Orders by user and recent first
//    Useful if you have dashboards showing "my orders" or per-salesperson view
//    Example: Order.find({ userId }).sort({ orderDate: -1 })
OrderSchema.index({ userId: 1, orderDate: -1 });

// 5) Status + deliverDate combined (e.g. what's coming soon per status)
//    Example: Order.find({ status: "in_progress" }).sort({ deliverDate: 1 })
OrderSchema.index({ status: 1, deliverDate: 1 });

// 6) (Optional) Fast access by deliverDate alone (e.g. reports/calendars)
//    Example: Order.find().sort({ deliverDate: 1 })
OrderSchema.index({ deliverDate: 1 });

// 7) (Text index) Full-text search in notes and product descriptions
//    NOTE: MongoDB allows only **one** text index per collection.
//    Adjust weights to prioritize "notes" over "products.description".
OrderSchema.index(
  { notes: "text", "products.description": "text" },
  {
    weights: { notes: 3, "products.description": 1 },
    name: "TextSearch_Notes_Products",
  }
);

// Virtual totals (whole pesos)
OrderSchema.virtual("itemsTotal").get(function () {
  return (this.products || []).reduce((sum, p) => sum + (p.price || 0), 0);
});

OrderSchema.virtual("totalDue").get(function () {
  return this.itemsTotal - (this.deposit || 0);
});

// Shipping guard
OrderSchema.pre("validate", function (next) {
  if (this.shipping?.isRequired) {
    const hasAddr = (this.shipping.addresses || []).length > 0;
    if (!hasAddr)
      return next(new Error("Shipping required but no addresses provided.")); // Handle i18 in the future
  }
  next();
});

// Urgency rule: auto if deliverDate - orderDate < 4 weeks
OrderSchema.pre("save", function (next) {
  if (this.orderDate && this.deliverDate) {
    const ms = this.deliverDate.getTime() - this.orderDate.getTime();
    const weeks = ms / (1000 * 60 * 60 * 24 * 7);
    this.isUrgentAuto = weeks < 4;
  } else {
    this.isUrgentAuto = false;
  }
  this.isUrgent = !!(this.isUrgentManual || this.isUrgentAuto);
  next();
});

module.exports = mongoose.model("Order", OrderSchema);
