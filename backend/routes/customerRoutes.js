const express = require("express");
const router = express.Router();

// Controller
const {
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");

// Middlewares
const { verifyToken, requireAdmin } = require("../middleware/auth");

//
// 🟢 GET ROUTES
//

// Get all customers
router.get("/", verifyToken, getCustomers);

// Get a customer by ID
router.get("/:id", verifyToken, getCustomerById);

//
// 🔵 PUT ROUTES
//

// Update customer data
router.put("/:id", verifyToken, updateCustomer);

//
// 🔴 DELETE ROUTES
//

// Delete customer (admin only)
router.delete("/:id", verifyToken, requireAdmin, deleteCustomer);

module.exports = router;
