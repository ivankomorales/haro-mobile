// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next(new ApiError("Token not provided", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch real user from DB
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ApiError("User no longer exists", 401));
    }

    req.user = user; // store full user document (can be filtered later)
    next();
  } catch (err) {
    return next(new ApiError("Invalid or expired token", 401));
  }
}; // end verifyToken

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return next(new ApiError("Admin access required", 403));
  }
  next();
}; // end requireAdmin

module.exports = {
  verifyToken,
  requireAdmin,
};
