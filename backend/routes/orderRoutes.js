const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  cancelOrder,
} = require("../controllers/orderController");

const { verifyToken, requireAdmin } = require("../middleware/auth");
const verifyOwnershipOrAdmin = require("../middleware/verifyOwnershipOrAdmin");
const {
  validateOrder,
  handleValidationErrors,
} = require("../utils/validators");

router.use(verifyToken); // Protect all routes below

router.get("/", getOrders);
router.get("/:id", verifyOwnershipOrAdmin, getOrderById);
router.post("/", validateOrder, handleValidationErrors, createOrder);
router.put(
  "/:id",
  verifyOwnershipOrAdmin,
  validateOrder,
  handleValidationErrors,
  updateOrder
);
router.delete("/:id", requireAdmin, cancelOrder);

module.exports = router;
