const Order = require("../models/Order");
const Counter = require("../models/Counter");
const Customer = require("../models/Customer");

// CREATE
const createOrder = async (req, res) => {
  try {
    // Step 1: Get customer info
    const customerData = req.body.customer;
    if (!customerData || !customerData.email) {
      return res
        .status(400)
        .json({ error: "Customer data with valid email is required." });
    }

    // Step 2: Search if customer already exists
    let customer = await Customer.findOne({
      email: customerData.email,
    });

    if (!customer) {
      // Create new customer
      customer = new Customer(customerData);
      await customer.save();
    }

    // Step 3: Generate Folio (ORD-000X)
    const counter = await Counter.findByIdAndUpdate(
      { _id: "order" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const orderID = `ORD-${String(counter.seq).padStart(4, "0")}`;

    // Step 4: Create order with customer reference
    const { customer: _, ...orderData } = req.body;

    const newOrder = new Order({
      ...orderData,
      customer: customer._id,
      orderID,
    });

    const saved = await newOrder.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({
      error: "Error creating order",
      details: err.message,
    });
  }
};

// READ all
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Error retrieving orders" });
  }
};

// READ one
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Error finding order" });
  }
};

// UPDATE
const updateOrder = async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ error: "Order not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Error updating order" });
  }
};

// DELETE
const deleteOrder = async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Order not found" });
    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting order" });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
};
