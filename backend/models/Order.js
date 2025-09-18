const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema(
  {
    street: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    zip: {
      type: String,
      required: true,
      trim: true,
      match: /^[0-9]{5}$/, // typical MX format
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: "Mexico",
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: /^[0-9]{10}$/, // 10 digits
    },
    reference: {
      type: String,
      trim: true,
    },
    countryCode: {
      type: String,
      default: "+52",
      trim: true,
    },
    name: {
      type: String,
      trim: true, // optional label like "Home", "Shop"
    },
  },
  { _id: true }
);

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
    discount: { type: Number, min: 0, default: 0 },
    description: { type: String, trim: true },
    // Figures = Number of sculptures in each product
    figures: { type: Number, min: 1, default: 1 },
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

    // shippingAddressId: { type: mongoose.Schema.Types.ObjectId, default: null }, // new reference
    // // (optional) snapshot to freeze data if the address later changes:
    // shippingSnapshot: { type: AddressSchema, default: undefined },
  },
  { _id: true }
);

const ShippingSchema = new mongoose.Schema(
  {
    isRequired: { type: Boolean, default: false },
    addresses: { type: [AddressSchema], default: [] },

    // ID of the selected address (if applicable)
    selectedAddressId: { type: mongoose.Schema.Types.ObjectId, default: null },

    // Optional snapshot of the address when confirming shipping
    selected: { type: AddressSchema, default: undefined },
  },
  { _id: false }
);

// Local validation: if isRequired=true, must have at least one address
ShippingSchema.path("addresses").validate(function (arr) {
  if (this.isRequired) return Array.isArray(arr) && arr.length > 0;
  return true;
}, "Shipping required but no addresses provided.");

// Local validation: selectedAddressId (if present) must exist in addresses
ShippingSchema.pre("validate", function (next) {
  if (!this.selectedAddressId) return next();
  const ok = (this.addresses || []).some(
    (a) => String(a._id) === String(this.selectedAddressId)
  );
  if (!ok)
    return next(
      new Error(
        "selectedAddressId does not match any address in shipping.addresses."
      )
    );
  next();
});

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
      type: ShippingSchema,
      default: () => ({ isRequired: false, addresses: [] }),
    },

    // Urgency (separate from workflow)
    isUrgentManual: { type: Boolean, default: false },
    isUrgentAuto: { type: Boolean, default: false },
    isUrgent: { type: Boolean, default: false, index: true },

    notes: { type: String, trim: true },
    // Materialized totals (for quick lists and sorting)
    gross: { type: Number, default: 0, min: 0, index: true }, // Σ qty*price
    discount: { type: Number, default: 0, min: 0, index: true }, // Σ qty*discount
    subtotal: { type: Number, default: 0, min: 0, index: true }, // gross - discount
    total: { type: Number, default: 0, min: 0, index: true }, // subtotal - deposit
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

// === Single recalculation utility (single source of truth) ===
function recalcTotals(orderLike) {
  const safe = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
  const A = Array.isArray(orderLike?.products) ? orderLike.products : [];

  let gross = 0;
  let discounts = 0;
  for (const p of A) {
    const qty = Math.max(1, safe(p.quantity, 1));
    const price = Math.max(0, safe(p.price, 0));
    const disc = Math.max(0, safe(p.discount, 0));
    gross += qty * price;
    discounts += qty * Math.min(disc, price); // prevent discount > price
  }
  const subtotal = Math.max(0, Math.round(gross - discounts));
  const deposit = Math.max(0, safe(orderLike?.deposit, 0));
  const total = Math.max(0, Math.round(subtotal - deposit));
  return {
    gross: Math.round(gross),
    discount: Math.round(discounts),
    subtotal,
    total,
  };
}

// === Recalculate totals BEFORE validating ===
OrderSchema.pre("validate", function (next) {
  const safeNum = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
  const products = Array.isArray(this.products) ? this.products : [];

  // Line sum: qty * max(price - discount, 0)
  const lineSum = products.reduce((acc, p) => {
    const qty = Math.max(1, safeNum(p.quantity, 1));
    const price = Math.max(0, safeNum(p.price, 0));
    const disc = Math.max(0, safeNum(p.discount, 0));
    const unit = Math.max(price - disc, 0);
    return acc + qty * unit;
  }, 0);

  this.subtotal = Math.max(0, Math.round(lineSum));
  this.total = Math.max(0, Math.round(lineSum - safeNum(this.deposit, 0)));
  next();
});

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

// 6.1) Stable ordering by date: orderDate DESC + createdAt DESC
OrderSchema.index({ orderDate: -1, createdAt: -1 });

OrderSchema.index({ total: -1 });

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

// 8) Shipping required fast filter (paired with date for dashboards)
OrderSchema.index({ "shipping.isRequired": 1, orderDate: -1 });

// Virtual totals (whole pesos)
OrderSchema.virtual("itemsTotal").get(function () {
  return this.gross || 0;
});
OrderSchema.virtual("totalDue").get(function () {
  return (this.subtotal || 0) - (this.deposit || 0);
});

// Shipping guard
OrderSchema.pre("validate", function (next) {
  Object.assign(this, recalcTotals(this));
  if (this.shipping?.isRequired) {
    const hasAddr = (this.shipping.addresses || []).length > 0;
    if (!hasAddr)
      return next(new Error("Shipping required but no addresses provided.")); // Handle i18n in the future
  }
  next();
});

// Urgency rule: auto if deliverDate - orderDate < 4 weeks
OrderSchema.pre("save", function (next) {
  // Recalculate subtotal/total on any save()
  Object.assign(this, recalcTotals(this));

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

// === Hook for atomic updates ===
OrderSchema.pre("findOneAndUpdate", async function (next) {
  try {
    // 1) Enforce validations on updates
    this.setOptions({ runValidators: true, context: "query" });

    const update = this.getUpdate() || {};
    const norm = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

    // 2) Normalize numeric inputs if they come in $set
    if (update.$set) {
      if ("deposit" in update.$set)
        update.$set.deposit = norm(update.$set.deposit);
      // Add other normalizations here if needed
      // e.g. if ('products' in update.$set) {...}
    }

    // 3) Current doc to simulate post-update
    const doc = await this.model.findOne(this.getQuery());
    if (!doc) return next(); // upsert or not found → let it continue

    // 4) Build the "updated doc" (shallow merge)
    const merged = doc.toObject();
    const patch = update.$set || update;
    Object.assign(merged, patch);

    // 5) Recalculate subtotal/total (same formula as in pre('validate')/pre('save'))
    const safeNum = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
    const products = Array.isArray(merged.products) ? merged.products : [];
    const lineSum = products.reduce((acc, p) => {
      const qty = Math.max(1, safeNum(p.quantity, 1));
      const price = Math.max(0, safeNum(p.price, 0));
      const disc = Math.max(0, safeNum(p.discount, 0));
      const unit = Math.max(price - disc, 0);
      return acc + qty * unit;
    }, 0);

    const subtotal = Math.max(0, Math.round(lineSum));
    const total = Math.max(
      0,
      Math.round(lineSum - safeNum(merged.deposit ?? doc.deposit, 0))
    );

    // 6) Recalculate urgency (same as your pre('save'))
    const orderDate = new Date(
      (merged.orderDate ?? doc.orderDate) || Date.now()
    );
    const deliverDate = new Date(
      (merged.deliverDate ?? doc.deliverDate) || orderDate
    );
    let isUrgentAuto = false;
    if (orderDate && deliverDate) {
      const ms = deliverDate.getTime() - orderDate.getTime();
      const weeks = ms / (1000 * 60 * 60 * 24 * 7);
      isUrgentAuto = weeks < 4;
    }
    const isUrgentManual =
      (merged.isUrgentManual ?? doc.isUrgentManual) || false;
    const isUrgent = !!(isUrgentManual || isUrgentAuto);

    // 7) Inject calculated fields into the final update
    this.setUpdate({
      ...update,
      $set: {
        ...(update.$set || {}),
        subtotal,
        total,
        isUrgentAuto,
        isUrgent,
      },
    });

    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Order", OrderSchema);
