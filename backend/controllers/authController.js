const User = require("../models/User");
const { logEvent } = require("../utils/audit");
const ApiError = require("../utils/ApiError");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Login
const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      await logEvent({
        event: "login_failed",
        description: `Login failed for email: ${email} (user not found)`,
        req,
      });
      return next(new ApiError("User does not exist", 400));
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      await logEvent({
        event: "login_failed",
        objectId: user._id,
        description: `Incorrect password attempt for ${email}`,
        req,
      });
      return next(new ApiError("Incorrect password", 401));
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    await logEvent({
      event: "login_success",
      objectId: user._id,
      description: `User ${user.email} logged in`,
      req,
    });

    res.json({ token, user: { name: user.name, role: user.role } });
  } catch (err) {
    next(err);
  }
}; //end login

// Logout
const logout = async (req, res, next) => {
  try {
    await logEvent({
      event: "logout",
      objectId: req.user._id,
      description: `${req.user.email} logged out`,
      req,
    });

    res.json({ message: "User logged out" });
  } catch (err) {
    next(err);
  }
}; // end logout

// Update Password
const updatePassword = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const { newPassword, currentPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return next(new ApiError("New password too short (min 6 chars)", 400));
    }

    if (!currentPassword) {
      return next(
        new ApiError("Current password required for verification", 400)
      );
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return next(new ApiError("Target user not found", 404));

    const actingUser = req.user; // comes from verifyToken

    // If not admin or authenticated user > out
    const isSelf = actingUser._id.toString() === targetUserId;
    const isAdmin = actingUser.role === "admin";

    if (!isSelf && !isAdmin) {
      return next(new ApiError("Not authorized to change this password", 403));
    }

    // Validate password wether admin or user is performing action
    const validPassword = await bcrypt.compare(
      currentPassword,
      actingUser.password
    );
    if (!validPassword) {
      return next(new ApiError("Incorrect password", 401));
    }

    // Change password
    const hashed = await bcrypt.hash(newPassword, 10);
    targetUser.password = hashed;
    await targetUser.save();

    //Log Event
    await logEvent({
      event: "password_updated",
      objectId: targetUser._id,
      description: isSelf
        ? "User changed their own password"
        : `Admin changed password of ${targetUser.email}`,
      req,
    });

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
}; // end updatePassword

module.exports = {
  login,
  logout,
  updatePassword,
};
