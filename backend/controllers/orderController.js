const Order = require("../models/Order");
const Counter = require("../models/Counter");
const Customer = require("../models/Customer");

// CREATE
const createOrder = async (req, res) => {
  try {
    // Step 1: Get userId, who is creating the order
    const userId = req.user.id;

    // Step 2: Get customer info
    const customerData = req.body.customer;
    if (!customerData || !customerData.email) {
      return res
        .status(400)
        .json({ error: "Customer data with valid email is required." });
    }

    // Step 3: Search if customer already exists
    let customer = await Customer.findOne({
      email: customerData.email,
    });

    if (!customer) {
      // Create new customer
      customer = new Customer(customerData);
      await customer.save();
    }

    // Step 4: Generate Folio (ORD-000X)
    const counter = await Counter.findByIdAndUpdate(
      { _id: "order" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const orderID = `ORD-${String(counter.seq).padStart(4, "0")}`;

    // Step 5: Create order with customer reference
    const { customer: _, ...orderData } = req.body;

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
      objectId,
      description: `Order ${orderID} created`,
      req,
    });

    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({
      error: "Error creating order",
      details: err.message,
    });
  }
}; // end createOrder

// READ all (w/ filters)
const getOrders = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Error retrieving orders" });
  }
}; // end getOrders

// READ one
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Error finding order" });
  }
}; // end getOrderById

// UPDATE
const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const originalStatus = order.status;
    Object.assign(order, req.body);
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
    res.status(500).json({ error: "Error updating order" });
  }
}; // end updateOrder

// CANCEL (Soft Delete)
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

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
    res.status(500).json({ error: "Error cancelling order" });
  }
}; // end cancelOrder

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  cancelOrder,
};
