const Order = require("../models/Order");
const Counter = require("../models/Counter");
const { findOrCreateCustomer } = require("./customerController");
const ApiError = require("../utils/ApiError");
const { logEvent } = require("../utils/audit");

// TODO: i18n TEXTS
// ---- status helpers (canonical + normalization) ----
const CANONICAL = new Set([
  "new",
  "pending",
  "inProgress",
  "completed",
  "cancelled",
]);

const LEGACY_MAP = {
  New: "new",
  Pending: "pending",
  "In Progress": "inProgress",
  in_progress: "inProgress",
  Completed: "completed",
  Cancelled: "cancelled",
};

function normalizeStatus(input) {
  if (!input) return undefined;
  const s = String(input);
  if (CANONICAL.has(s)) return s; // already canonical
  if (LEGACY_MAP[s]) return LEGACY_MAP[s]; // direct legacy map

  const clean = s.toLowerCase().replace(/[-_ ]+/g, "");
  if (clean === "inprogress") return "inProgress";
  if (clean === "new") return "new";
  if (clean === "pending") return "pending";
  if (clean === "completed") return "completed";
  if (clean === "cancelled") return "cancelled";
  return undefined;
}

// group used by your "pending" filter (new+pending+inProgress)
const PENDING_GROUP = ["new", "pending", "inProgress"];

// ---------------------------------------------
// 🟠 CREATE ORDER (POST /api/orders)
// ---------------------------------------------
const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const customer = await findOrCreateCustomer(req.body.customer, req);

    const counter = await Counter.findByIdAndUpdate(
      { _id: "order" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const orderID = `ORD-${String(counter.seq).padStart(4, "0")}`;

    const allowedFields = [
      "status",
      "deposit",
      "notes",
      "products",
      "shipping",
      "orderDate",
      "deliverDate",
    ];
    const orderData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        orderData[field] = req.body[field];
      }
    }
    if (!orderData.orderDate) {
      orderData.orderDate = new Date(); // default to "today"
    }
    const newOrder = new Order({
      ...orderData,
      userId,
      customer: customer._id,
      orderID,
    });

    const saved = await newOrder.save();

    await logEvent({
      event: "order_created",
      objectId: saved._id,
      description: `Order ${orderID} created`,
      req,
    });

    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Error creating order:", err);

    if (err.name === "ValidationError") {
      for (const field in err.errors) {
        console.error(`→ ${field}: ${err.errors[field].message}`);
      }
    }

    const message = err.message || "Unknown error";
    next(new ApiError(message, 500));
  }
}; // end createOrder

// ---------------------------------------------
// 🟢 GET ALL ORDERS (GET /api/orders)
// ---------------------------------------------
const getOrders = async (req, res, next) => {
  try {
    const raw = req.query.status; // do not force lowercase blindly
    const filter = {};

    // Keep your current semantics: status=pending means the group new+pending+inProgress
    if (raw && String(raw).toLowerCase() === 'pending') {
      filter.status = { $in: PENDING_GROUP };
    } else if (raw) {
      const canon = normalizeStatus(raw);
      if (canon) {
        filter.status = canon;
      } else {
        // Unknown status input -> return empty set or ignore filter. Here, ignore.
      }
    }

    // orderDate range
    const orderDateFilter = {};
    if (req.query.from) orderDateFilter.$gte = new Date(req.query.from);
    if (req.query.to) {
      const toDate = new Date(req.query.to);
      toDate.setDate(toDate.getDate() + 1);
      orderDateFilter.$lt = toDate;
    }
    if (Object.keys(orderDateFilter).length) filter.orderDate = orderDateFilter;

    if (req.query.countOnly === 'true') {
      const count = await Order.countDocuments(filter);
      return res.json({ count });
    }

    const sortOrder = req.query.sort === 'asc' ? 1 : -1;
    const limit = parseInt(req.query.limit, 10) || 0;

    const orders = await Order.find(filter)
      .populate('customer')
      .sort({ orderDate: sortOrder })
      .limit(limit);

    res.json(orders);
  } catch (err) {
    next(new ApiError('Error retrieving orders', 500));
  }
}; // end getOrders

// ---------------------------------------------
// 🟢 GET ORDER BY ID (GET /api/orders/:id)
// ---------------------------------------------
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer")
      .populate("products.glazes.interior")
      .populate("products.glazes.exterior");

    if (!order) {
      return next(new ApiError("Order not found", 404));
    }

    res.json(order);
  } catch (err) {
    next(new ApiError("Error retrieving order", 500));
  }
}; // end getOrderById

// ---------------------------------------------
// 🟢 GET ORDERS BY USER (GET /api/orders/user/:userId)
// ---------------------------------------------
const getOrdersByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const orders = await Order.find({ userId });
    res.json(orders);
  } catch (error) {
    console.error("Error getting orders by user:", error);
    res.status(500).json({ message: "Server error" });
  }
}; // end getOrdersByUser

// ---------------------------------------------
// 🟢 GET ORDERS BY STATUS (GET /api/orders/status/:status)
// ---------------------------------------------
const getOrdersByStatus = async (req, res) => {
  try {
    const canon = normalizeStatus(req.params.status);
    if (!canon) return res.status(400).json({ message: 'Invalid status' });

    const orders = await Order.find({ status: canon });
    res.json(orders);
  } catch (error) {
    console.error('Error getting orders by status:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; // end getOrdersByStatus

// ---------------------------------------------
// 🔵 UPDATE ORDER (PUT /api/orders/:id)
// ---------------------------------------------
const updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return next(new ApiError("Order not found", 404));
    }

    const originalStatus = order.status;
    const allowedFields = [
      "status",
      "deposit",
      "notes",
      "products",
      "shipping",
      "orderDate",
      "deliverDate",
    ];

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        order[key] = req.body[key];
      }
    }

    await order.save();

    const changes = [];
    if (req.body.status && req.body.status !== originalStatus) {
      changes.push(`status: ${originalStatus} → ${req.body.status}`);
    }

    if (changes.length > 0) {
      await logEvent({
        event: "order_updated",
        objectId: order._id,
        description: `Order ${order.orderID} updated (${changes.join(", ")})`,
        req,
      });
    }

    res.json(order);
  } catch (err) {
    next(new ApiError("Error updating order", 500));
  }
}; // end updateOrder

// ---------------------------------------------
// 🟣 UPDATE ORDER STATUS ONLY (PATCH /api/orders/:id/status)
// ---------------------------------------------
const updateOrderStatus = async (req, res) => {
  try {
    const canon = normalizeStatus(req.body.status);
    const orderId = req.params.id;

    if (!canon) {
      return res.status(400).json({ message: 'Status is required and must be valid' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: canon },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) return res.status(404).json({ message: 'Order not found' });
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; // end updateOrderStatus

// ---------------------------------------------
// 🟣 BULK STATUS UPDATE (PATCH /api/orders/bulk-status)
// ---------------------------------------------
const updateManyOrderStatus = async (req, res) => {
  console.log('🟡 bulk status controller HIT');
  console.log('📦 Body recibido:', req.body);

  try {
    const { orderIds, newStatus } = req.body;
    const canon = normalizeStatus(newStatus);

    if (!Array.isArray(orderIds) || orderIds.length === 0 || !canon) {
      return res.status(400).json({ message: 'Missing orderIds or newStatus (invalid)' });
    }

    const result = await Order.updateMany(
      { _id: { $in: orderIds } },
      { $set: { status: canon } },
      { runValidators: true }
    );

    res.json({ message: 'Bulk status update complete', result });
  } catch (error) {
    console.error('❌ Error in bulk status update:', error.message, error.stack);
    res.status(500).json({ message: 'Server error' });
  }
};
 // end updateManyOrderStatus

// ---------------------------------------------
// 🟣 ADD ORDER NOTE (PATCH /api/orders/:id/notes)
// ---------------------------------------------
const addOrderNote = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { note } = req.body;

    if (!note) {
      return res.status(400).json({ message: "Note is required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.notes = note;

    await order.save();
    res.json(order);
  } catch (error) {
    console.error("Error adding note:", error);
    res.status(500).json({ message: "Server error" });
  }
}; // end addOrderNote

// ---------------------------------------------
// 🔴 CANCEL ORDER (DELETE /api/orders/:id)
// ---------------------------------------------
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return next(new ApiError("Order not found", 404));
    }

    order.status = "cancelled";
    await order.save();

    await logEvent({
      event: "order_cancelled",
      objectId: order._id,
      description: `Order ${order.orderID} cancelled`,
      req,
    });

    res.json({ message: "Order cancelled" });
  } catch (err) {
    next(new ApiError("Error cancelling order", 500));
  }
}; // end cancelOrder

// ---------------------------------------------
// 📦 EXPORT CONTROLLER METHODS
// ---------------------------------------------
module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  getOrdersByUser,
  getOrdersByStatus,
  updateOrder,
  updateOrderStatus,
  updateManyOrderStatus,
  addOrderNote,
  cancelOrder,
};
