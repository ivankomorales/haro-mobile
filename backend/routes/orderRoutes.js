const express = require("express");
const router = express.Router();

// Controller methods
const {
  createOrder,
  getOrders,
  getOrderById,
  getOrdersByUser,
  getOrdersByStatus,
  updateOrder,
  updateOrderStatus,
  addOrderNote,
  cancelOrder,
} = require("../controllers/orderController");

// Middlewares
const { verifyToken, requireAdmin } = require("../middleware/auth");
const verifyOwnershipOrAdmin = require("../middleware/verifyOwnershipOrAdmin");
const {
  validateOrder,
  handleValidationErrors,
} = require("../utils/validators");

// 🔐 Protect all routes below with auth
router.use(verifyToken);

//
// 🟢 GET ROUTES
//

// Get all orders (with optional filters)
router.get("/", getOrders);

// Get single order by ID
router.get("/:id", verifyOwnershipOrAdmin, getOrderById);

// Get orders by user ID
router.get("/user/:userId", verifyOwnershipOrAdmin, getOrdersByUser);

// Get orders by status
router.get("/status/:status", requireAdmin, getOrdersByStatus);

//
// 🟠 POST ROUTES
//

// Create a new order
router.post("/", validateOrder, handleValidationErrors, createOrder);

// Add a note to an order
router.post("/:id/notes", verifyOwnershipOrAdmin, addOrderNote);

//
// 🔵 PUT ROUTES
//

// Update full order (requires all fields)
router.put(
  "/:id",
  verifyOwnershipOrAdmin,
  validateOrder,
  handleValidationErrors,
  updateOrder
);

//
// 🟣 PATCH ROUTES
//

// Update only the order status
router.patch("/:id/status", verifyOwnershipOrAdmin, updateOrderStatus);

//
// 🔴 DELETE ROUTES
//

// Cancel (soft delete) an order
router.delete("/:id", requireAdmin, cancelOrder);

//
// EXPORT ROUTER
//
module.exports = router;
