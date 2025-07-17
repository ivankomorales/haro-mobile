const checkRole = (allowedRole) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== allowedRole) {
      return res
        .status(403)
        .json({ error: "Access denied: insufficient role" });
    }
    next();
  };
};

module.exports = checkRole;
