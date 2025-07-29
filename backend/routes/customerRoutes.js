const express = require("express");
const router = express.Router();
const {
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");

const { verifyToken, requireAdmin } = require("../middleware/auth");

// List & Get
router.get("/", verifyToken, getCustomers);
router.get("/:id", verifyToken, getCustomerById);

// Modify
router.put("/:id", verifyToken, updateCustomer);
router.delete("/:id", verifyToken, requireAdmin, deleteCustomer);

module.exports = router;
