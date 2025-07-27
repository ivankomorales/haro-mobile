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

router.use(verifyToken); // Protect all routes below

router.get("/", getOrders); // anyone logged in can fetch list (optional: filter by user in controller)
router.get("/:id", verifyOwnershipOrAdmin, getOrderById);
router.post("/", createOrder); // will use req.user.id as owner inside controller
router.put("/:id", verifyOwnershipOrAdmin, updateOrder);
router.delete("/:id", requireAdmin, cancelOrder); //Admin only

module.exports = router;
