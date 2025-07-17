const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderController");

const { verifyToken, requireAdmin } = require("../middleware/auth");

router.use(verifyToken); // Protect all routes below

router.get("/", getOrders);
router.get("/:id", getOrderById);
router.post("/", createOrder);
router.put("/:id", updateOrder);
router.delete("/:id", requireAdmin, deleteOrder); //Admin only

module.exports = router;
