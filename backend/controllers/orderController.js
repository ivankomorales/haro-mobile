const Order = require("../models/Order");
const Counter = require("../models/Counter");
const { findOrCreateCustomer } = require("./customerController");
const ApiError = require("../utils/ApiError");
const { logEvent } = require("../utils/audit");

// CREATE
const createOrder = async (req, res, next) => {
  try {
    // Step 1: Get userId, who is creating the order
    const userId = req.user.id;

    // Step 2: Get or create customer
    const customer = await findOrCreateCustomer(req.body.customer, req);

    // Step 3: Generate Folio (ORD-000X)
    const counter = await Counter.findByIdAndUpdate(
      { _id: "order" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const orderID = `ORD-${String(counter.seq).padStart(4, "0")}`;

    // Step 4: Create order with customer reference
    const allowedFields = [
      "status",
      "deposit",
      "notes",
      "products",
      "shipping",
    ];
    const orderData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        orderData[field] = req.body[field];
      }
    }

    const newOrder = new Order({
      ...orderData,
      userId,
      customer: customer._id,
      orderID,
    });
    const saved = await newOrder.save();

    // Log Event
    await logEvent({
      event: "order_created",
      objectId: saved._id,
      description: `Order ${orderID} created`,
      req,
    });

    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Error creating order:");
    console.error(err); // Esto muestra el objeto completo

    if (err.name === "ValidationError") {
      console.error("🧩 Mongoose ValidationError details:");
      for (const field in err.errors) {
        console.error(`→ ${field}: ${err.errors[field].message}`);
      }
    }

    const message = err.message || "Unknown error";
    next(new ApiError(message, 500));
  }
}; // end createOrder

// READ all (with optional status filter)
const getOrders = async (req, res, next) => {
  try {
    const status = req.query.status?.toLowerCase();
    let filter = {};

    // Filter by Status (Pending = all New. Pending and In Progress)
    // i.e. all Orders that are not completed or cancelled
    if (status === "pending") {
      filter.status = { $in: ["New", "Pending", "In Progress"] };
    } else if (status) {
      // Capitalize first letter to match DB (if saved like "New")
      const normalized = status.charAt(0).toUpperCase() + status.slice(1);
      filter.status = normalized;
    }

    //Filter by Date
    const createdAtFilter = {};
    if (req.query.from) {
      createdAtFilter.$gte = new Date(req.query.from);
    }
    if (req.query.to) {
      const toDate = new Date(req.query.to);
      toDate.setDate(toDate.getDate() + 1);
      createdAtFilter.$lt = toDate;
    }
    if (Object.keys(createdAtFilter).length > 0) {
      filter.createdAt = createdAtFilter;
    }

    // Return count only if requested
    if (req.query.countOnly === "true") {
      const count = await Order.countDocuments(filter);
      return res.json({ count });
    }

    const sortOrder = req.query.sort === "asc" ? 1 : -1;
    const limit = parseInt(req.query.limit) || 0;

    const orders = await Order.find(filter)
      .populate("customer")
      .sort({ createdAt: sortOrder })
      .limit(limit);
    res.json(orders);
  } catch (err) {
    next(new ApiError("Error retrieving orders", 500));
  }
}; // end getOrders

// READ one
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("customer");
    if (!order) {
      return next(new ApiError("Order not found", 404));
    }

    res.json(order);
  } catch (err) {
    next(new ApiError("Error retrieving order", 500));
  }
}; // end getOrderById

// UPDATE
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

    // Log Event
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

// CANCEL (Soft Delete)
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return next(new ApiError("Order not found", 404));
    }

    order.status = "Cancelled";
    await order.save();

    // Log Event
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

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  cancelOrder,
};
