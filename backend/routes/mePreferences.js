// routes/mePreferences.js
const express = require("express");
const router = express.Router();
const { param, body } = require("express-validator");
const { verifyToken } = require("../middleware/auth");
const ApiError = require("../utils/ApiError");
const UserPreference = require("../models/UserPreference");

router.use(verifyToken);

router.get(
  "/:namespace",
  param("namespace").isString().trim().notEmpty(),
  async (req, res, next) => {
    try {
      const doc = await UserPreference.findOne({
        user: req.user.id,
        namespace: req.params.namespace,
        key: "_",
      }).lean();
      res.json({ namespace: req.params.namespace, value: doc?.value ?? null });
    } catch (e) {
      next(new ApiError("Error loading preferences", 500));
    }
  }
);

router.put(
  "/:namespace",
  param("namespace").isString().trim().notEmpty(),
  body("value").exists(),
  async (req, res, next) => {
    try {
      const { namespace } = req.params;
      const { value } = req.body;
      const doc = await UserPreference.findOneAndUpdate(
        { user: req.user.id, namespace, key: "_" },
        { $set: { value } },
        { upsert: true, new: true }
      ).lean();
      res.json({ message: "Preferences saved", namespace, value: doc.value });
    } catch (e) {
      next(new ApiError("Error saving preferences", 500));
    }
  }
);

module.exports = router;
