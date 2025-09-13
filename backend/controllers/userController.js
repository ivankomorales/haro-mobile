const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const { logEvent } = require("../utils/audit");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

// TODO: i18n TEXTS

// ---------------------------------------------
// 🟠 CREATE USER (POST /api/users)
// ---------------------------------------------
const createUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError("Validation failed", 400, errors.array()));
  }

  const { name, lastName, email, password, role } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return next(new ApiError("A user with that email already exists", 400));
    }

    const hash = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      lastName,
      email,
      password: hash,
      role: role || "employee",
    });

    await newUser.save();

    // Log Event
    await logEvent({
      event: "user_created",
      objectId: newUser._id,
      description: `User ${newUser.name} ${newUser.lastName || ""} (${
        newUser.email
      }) created by ${req.user.name || "System"}`,
      req,
    });

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    next(new ApiError("Error creating user", 500, err.message));
  }
}; // end createUser

// ---------------------------------------------
// 🟢 GET CURRENT USER (GET /api/users/me)
// ---------------------------------------------
const getMe = async (req, res, next) => {
  try {
    // req.user viene de verifyToken (token tiene { id, role })
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return next(new ApiError("User not found", 404));
    res.json(user);
  } catch (err) {
    next(new ApiError("Error retrieving current user", 500));
  }
};

// ---------------------------------------------
// 🟢 GET ALL USERS (GET /api/users)
// ---------------------------------------------
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort();
    res.json(users);
  } catch (err) {
    next(new ApiError("Error retrieving users", 500));
  }
}; // end getUsers

// ---------------------------------------------
// 🟢 GET USER BY ID (GET /api/users/:id)
// ---------------------------------------------
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new ApiError("User not found", 404));
    res.json(user);
  } catch (err) {
    next(new ApiError("Error retrieving user", 500));
  }
}; // end getUserById

// ---------------------------------------------
// 🔵 UPDATE CURRENT USER (PATCH /api/users/me)
// ---------------------------------------------
const updateMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return next(new ApiError("User not found", 404));

    const allowed = ["name", "lastName", "avatarUrl", "email"]; // 👈 lo que permites tocar
    const changes = [];

    for (const k of allowed) {
      if (k in req.body && req.body[k] !== user[k]) {
        changes.push(`${k}: ${user[k] ?? "—"} → ${req.body[k]}`);
        user[k] = req.body[k];
      }
    }

    await user.save();

    if (changes.length) {
      await logEvent({
        event: "me_updated",
        objectId: user._id,
        description: `User updated own profile: ${changes.join(", ")}`,
        req,
      });
    }

    res.json({
      message: "Profile updated",
      user: {
        _id: user._id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    next(new ApiError("Error updating profile", 500));
  }
}; //end updateMe

// ---------------------------------------------
// 🔵 UPDATE USER (PUT /api/users/:id)
// ---------------------------------------------
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new ApiError("User not found", 404));

    const { name, lastName, email, role } = req.body;
    const changes = [];

    if (name && name !== user.name) {
      changes.push(`name: ${user.name} → ${name}`);
      user.name = name;
    }

    if (lastName && lastName !== user.lastName) {
      changes.push(`lastName: ${user.lastName || "—"} → ${lastName}`);
      user.lastName = lastName;
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

    // Log Event
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
    next(new ApiError("Error updating user", 500));
  }
}; // end updateUser

// ---------------------------------------------
// 🔴 DELETE USER (DELETE /api/users/:id)
// ---------------------------------------------
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new ApiError("User not found", 404));

    user.isActive = false;
    await user.save();

    // Log Event
    await logEvent({
      event: "user_deactivated",
      objectId: user._id,
      description: `${req.user.name} deactivated user ${user.name}`,
      req,
    });

    res.json({ message: "User deactivated" });
  } catch (err) {
    next(new ApiError("Error deleting user", 500, err.message));
  }
}; // end deleteUser

// ---------------------------------------------
// 📦 EXPORT CONTROLLER METHODS
// ---------------------------------------------
module.exports = {
  createUser,
  getMe ,
  getUsers,
  getUserById,
  updateMe,
  updateUser,
  deleteUser,
};
