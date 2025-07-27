const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token not provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch real user from DB
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "User no longer exists" });
    }

    req.user = user; // store full user document (you can filter it later)
    next();
  } catch (err) {
    console.error("verifyToken error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

module.exports = {
  verifyToken,
  requireAdmin,
};
