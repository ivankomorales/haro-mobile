// routes/orderDrafts.js
const express = require("express");
const router = express.Router();
const OrderDraft = require("../models/OrderDraft");

// Middlewares
const { verifyToken /*, requireAdmin */ } = require("../middleware/auth");

// 🔐 Protect all routes below with auth (same pattern as orderRoutes.js)
router.use(verifyToken);

/**
 * 🟠 Create a new draft for the logged-in user
 * Body: { label?: string, data?: object }
 * Returns: { _id }
 */
router.post("/", async (req, res) => {
  try {
    const { label, data } = req.body || {};
    const draft = await OrderDraft.create({
      userId: req.user._id,
      label: label || undefined,
      data: data || {},
    });
    res.json({ _id: draft._id.toString() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to create draft" });
  }
});

/**
 * 🟢 Get a draft that belongs to the logged-in user
 * Params: :id
 * Returns: { _id, data, updatedAt }
 */
router.get("/:id", async (req, res) => {
  try {
    const draft = await OrderDraft.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!draft) return res.status(404).json({ message: "Not found" });
    res.json({
      _id: draft._id.toString(),
      data: draft.data,
      updatedAt: draft.updatedAt,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to fetch draft" });
  }
});

/**
 * 🔵 Update (replace) draft data/label
 * Params: :id
 * Body: { data?: object, label?: string }
 * Returns: { ok: true }
 */
router.put("/:id", async (req, res) => {
  try {
    const { data, label } = req.body || {};
    const days = 7;
    const nextExpiry = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const updated = await OrderDraft.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        $set: {
          data: data || {},
          label: label || undefined,
          expiresAt: nextExpiry,
        },
      },
      { new: true, upsert: false }
    );
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to update draft" });
  }
});

/**
 * 🔴 Delete a draft that belongs to the logged-in user
 * Params: :id
 * Returns: { ok: true }
 */
router.delete("/:id", async (req, res) => {
  try {
    await OrderDraft.deleteOne({ _id: req.params.id, userId: req.user._id });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to delete draft" });
  }
});

module.exports = router;
