const User = require("../models/User");
const { logEvent } = require("../utils/audit");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      await logEvent({
        event: "login_failed",
        description: `Login failed for email: ${email} (user not found)`,
        req,
      });
      return res.status(400).json({ error: "User does not exist" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      await logEvent({
        event: "login_failed",
        objectId: user._id,
        description: `Incorrect password attempt for ${email}`,
        req,
      });
      return res.status(401).json({ error: "Incorrect password" });
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
    res.status(500).json({ error: "Login error" });
  }
}; //end login

// Logout
const logout = async (req, res) => {
  try {
    await logEvent({
      event: "logout",
      objectId: req.user._id,
      description: `${req.user.email} logged out`,
      req,
    });

    res.json({ message: "User logged out" });
  } catch (err) {
    res.status(500).json({ error: "Logout error" });
  }
}; // end logout

// Update Password
const updatePassword = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const { newPassword, currentPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "New password too short (min 6 chars)" });
    }

    if (!currentPassword) {
      return res
        .status(400)
        .json({ error: "Current password required for verification" });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser)
      return res.status(404).json({ error: "Target user not found" });

    const actingUser = req.user; // comes from verifyToken

    // If not admin or authenticated user > out
    const isSelf = actingUser._id.toString() === targetUserId;
    const isAdmin = actingUser.role === "admin";

    if (!isSelf && !isAdmin) {
      return res
        .status(403)
        .json({ error: "Not authorized to change this password" });
    }

    // Validate password wether admin or user is performing action
    const validPassword = await bcrypt.compare(
      currentPassword,
      actingUser.password
    );
    if (!validPassword) {
      return res.status(401).json({ error: "Incorrect password" });
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
    console.error("updatePassword error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}; // end updatePassword

module.exports = {
  login,
  logout,
  updatePassword,
};
