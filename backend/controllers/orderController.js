const Order = require("../models/Order");
const Counter = require("../models/Counter");
const { findOrCreateCustomer } = require("./customerController");
const ApiError = require("../utils/ApiError");
const { logEvent } = require("../utils/audit");

// TODO: i18n TEXTS

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
      "status", "deposit", "notes", "products",
      "shipping", "orderDate", "deliverDate",
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
    const status = req.query.status?.toLowerCase();
    let filter = {};

    if (status === "pending") {
      filter.status = { $in: ["New", "Pending", "In Progress"] };
    } else if (status) {
      const normalized = status.charAt(0).toUpperCase() + status.slice(1);
      filter.status = normalized;
    }

    const orderDateFilter = {};
    if (req.query.from) {
      orderDateFilter.$gte = new Date(req.query.from);
    }
    if (req.query.to) {
      const toDate = new Date(req.query.to);
      toDate.setDate(toDate.getDate() + 1);
      orderDateFilter.$lt = toDate;
    }
    if (Object.keys(orderDateFilter).length > 0) {
      filter.orderDate = orderDateFilter;
    }

    if (req.query.countOnly === "true") {
      const count = await Order.countDocuments(filter);
      return res.json({ count });
    }

    const sortOrder = req.query.sort === "asc" ? 1 : -1;
    const limit = parseInt(req.query.limit) || 0;

    const orders = await Order.find(filter)
      .populate("customer")
      .sort({ orderDate: sortOrder })
      .limit(limit);

    res.json(orders);
  } catch (err) {
    next(new ApiError("Error retrieving orders", 500));
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
    const status = req.params.status;
    const orders = await Order.find({ status });
    res.json(orders);
  } catch (error) {
    console.error("Error getting orders by status:", error);
    res.status(500).json({ message: "Server error" });
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
      "status", "deposit", "notes", "products",
      "shipping", "orderDate", "deliverDate",
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
    const { status } = req.body;
    const orderId = req.params.id;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Server error" });
  }
}; // end updateOrderStatus

// ---------------------------------------------
// 🟣 BULK STATUS UPDATE (PATCH /api/orders/bulk-status)
// ---------------------------------------------
const updateManyOrderStatus = async (req, res) => {
  try {
    const updates = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: "No updates provided" });
    }

    const bulkOps = updates.map(({ _id, status }) => ({
      updateOne: {
        filter: { _id },
        update: { status },
      },
    }));

    const result = await Order.bulkWrite(bulkOps);

    res.json({ message: "Bulk status update complete", result });
  } catch (error) {
    console.error("Error in bulk status update:", error);
    res.status(500).json({ message: "Server error" });
  }
}; // end updateManyOrderStatus

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

    order.status = "Cancelled";
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
