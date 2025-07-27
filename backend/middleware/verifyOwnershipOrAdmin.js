const Order = require("../models/Order"); // o el modelo correspondiente

const verifyOwnershipOrAdmin = async (req, res, next) => {
  try {
    const userId = req.user.id; // viene del token JWT
    const userRole = req.user.role; // 'admin' o 'vendedor'
    const orderId = req.params.id;

    console.log("Verifying order access:", { userId, userRole, orderId }); // 👈 DEBUG

    const order = await Order.findById(orderId);
    console.log("Fetched order:", order); // 👈 DEBUG
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Si es admin, puede hacer lo que sea. Si no, verifica propiedad.
    if (userRole === "admin" || order.userId.toString() === userId) {
      next();
    } else {
      return res
        .status(403)
        .json({ error: "Not authorized to access this resource" });
    }
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = verifyOwnershipOrAdmin;
