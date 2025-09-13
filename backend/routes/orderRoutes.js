const express = require("express");
const router = express.Router();

// Controller methods
const {
  createOrder,
  getOrders,
  getOrderById,
  getOrdersByUser,
  getOrdersByStatus,
  getOrderStats,
  updateOrder,
  updateOrderStatus,
  updateManyOrderStatus,
  addOrderNote,
  cancelOrder,
} = require("../controllers/orderController");

const { exportOrdersToPDF } = require("../controllers/exportController");
const { exportOrdersToExcel } = require("../controllers/exportController");

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

// Get orders by user ID
router.get("/user/:userId", verifyOwnershipOrAdmin, getOrdersByUser);

// Get orders by status
router.get("/status/:status", requireAdmin, getOrdersByStatus);

// Get orders stats
router.get("/stats", requireAdmin, getOrderStats);
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

// Update status on multiple orders
router.patch("/bulk/status", requireAdmin, updateManyOrderStatus);

// Update only the order status
router.patch("/:id/status", verifyOwnershipOrAdmin, updateOrderStatus);

//
// 🔴 DELETE ROUTES
//

// Cancel (soft delete) an order
router.delete("/:id", requireAdmin, cancelOrder);

//
// 📤 EXPORT ROUTES
//

router.post("/export/pdf", requireAdmin, exportOrdersToPDF);
// futuros: excel, word
router.post("/export/excel", requireAdmin, exportOrdersToExcel);
// router.post("/export/word", requireAdmin, exportOrdersToWord);

//
// 🧾 GET BY ID (keep at end to avoid collisions)
//

router.get("/:id", verifyOwnershipOrAdmin, getOrderById);

//
// EXPORT ROUTER
//

module.exports = router;
