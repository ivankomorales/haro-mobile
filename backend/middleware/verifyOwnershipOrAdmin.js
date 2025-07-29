// middleware/verifyOwnershipOrAdmin.js
const ApiError = require("../utils/ApiError");
const Order = require("../models/Order");

const verifyOwnershipOrAdmin = async (req, res, next) => {
  try {
    const userId = req.user.id; // comes from token JWT
    const userRole = req.user.role; // 'admin' or 'employee'
    const orderId = req.params.id;

    // console.log("Verifying order access:", { userId, userRole, orderId }); // DEBUG

    const order = await Order.findById(orderId);
    // console.log("Fetched order:", order); // DEBUG
    if (!order) return next(new ApiError("Order not found", 404));

    // If admin, may perform, otherwise check ownership
    if (userRole === "admin" || order.userId.toString() === userId) {
      next();
    } else {
      return next(new ApiError("Not authorized to access this resource", 403));
    }
  } catch (err) {
    return next(new ApiError("Server error", 500));
  }
};

module.exports = verifyOwnershipOrAdmin;
