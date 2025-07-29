// middleware/checkRole.js
const ApiError = require("../utils/ApiError");

const checkRole = (allowedRole) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== allowedRole) {
      return next(new ApiError("Access denied: insufficient role", 403));
    }
    next();
  };
};

module.exports = checkRole;
