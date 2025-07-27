const User = require("../models/User");
const { logEvent } = require("../utils/audit");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

// POST /api/users (admin only)
const createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, role } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ error: "A user with that email already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hash,
      role: role || "employee",
    });

    await newUser.save();

    await logEvent({
      event: "user_created",
      objectId: newUser._id,
      description: `User ${newUser.email} created by ${req.user.name || "System"}`,
      req,
    });

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error creating user", details: err.message });
  }
}; // end createUser

// DELETE /users/:id (Soft Delete)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.isActive = false;
    await user.save();

    await logEvent({
      event: "user_deactivated",
      objectId: user._id,
      description: `${req.user.name} deactivated user ${user.name}`,
      req,
    });

    res.json({ message: "User deactivated" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
}; // end ddeleteUser

// GET /users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Error retrieving users" });
  }
};

// GET /users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Error finding user" });
  }
};

// PUT /users/:id
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { name, email, role } = req.body;
    const changes = [];

    if (name && name !== user.name) {
      changes.push(`name: ${user.name} → ${name}`);
      user.name = name;
    }

    if (email && email !== user.email) {
      changes.push(`email: ${user.email} → ${email}`);
      user.email = email;
    }

    if (role && role !== user.role) {
      changes.push(`role: ${user.role} → ${role}`);
      user.role = role;
    }

    await user.save();

    if (changes.length > 0) {
      await logEvent({
        event: "user_updated",
        objectId: user._id,
        description: `Updated user: ${changes.join(", ")}`,
        req,
      });
    }

    res.json({ message: "User updated" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  createUser,
};
