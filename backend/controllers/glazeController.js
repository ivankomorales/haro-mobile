const Glaze = require("../models/Glaze");
const { logEvent } = require("../utils/audit");
const { validationResult } = require("express-validator");

// Create
const createGlaze = async (req, res) => {
  const { name, colorHex, image } = req.body;

  if (!name || !colorHex) {
    return res
      .status(400)
      .json({ error: "Name and colorHex are required fields" });
  }

  try {
    const existing = await Glaze.findOne({ name });
    if (existing) {
      return res
        .status(400)
        .json({ error: "Glaze with that name already exists" });
    }

    const glaze = new Glaze({ name, colorHex, image });
    const saved = await glaze.save();

    await logEvent({
      event: "glaze_created",
      objectId: saved._id,
      description: `Glaze ${saved.name} created`,
      req,
    });

    res.status(201).json(saved);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error creating glaze", details: err.message });
  }
}; // end createGlaze

// Read one
const getGlazeById = async (req, res) => {
  try {
    const glaze = await Glaze.findById(req.params.id);
    if (!glaze) return res.status(404).json({ error: "Glaze not found" });
    res.json(glaze);
  } catch (err) {
    res.status(500).json({ error: "Error retrieving glaze" });
  }
}; // end getGlazeById

// Read all (Including inactive filter)
const getGlazes = async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === "true";
    const filter = includeInactive ? {} : { isActive: true };

    const glazes = await Glaze.find(filter).sort("name");
    res.json(glazes);
  } catch (err) {
    res.status(500).json({ error: "Error fetching glazes" });
  }
}; // end getGlazes

// Update
const updateGlaze = async (req, res) => {
  try {
    const glaze = await Glaze.findById(req.params.id);
    if (!glaze) return res.status(404).json({ error: "Glaze not found" });

    const changes = [];

    if (req.body.name && req.body.name !== glaze.name) {
      changes.push(`name: ${glaze.name} → ${req.body.name}`);
      glaze.name = req.body.name;
    }

    if (req.body.colorHex && req.body.colorHex !== glaze.colorHex) {
      changes.push(`colorHex: ${glaze.colorHex} → ${req.body.colorHex}`);
      glaze.colorHex = req.body.colorHex;
    }

    if (req.body.image && req.body.image !== glaze.image) {
      changes.push(`image updated`);
      glaze.image = req.body.image;
    }

    const updated = await glaze.save();

    if (changes.length > 0) {
      await logEvent({
        event: "glaze_updated",
        objectId: glaze._id,
        description: `Glaze ${glaze.name} updated: ${changes.join(", ")}`,
        req,
      });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Error updating glaze" });
  }
}; // end updateGlaze

// Soft Delete
const deactivateGlaze = async (req, res) => {
  try {
    const glaze = await Glaze.findById(req.params.id);
    if (!glaze) return res.status(404).json({ error: "Glaze not found" });
    if (!glaze.isActive) {
      return res.status(400).json({ error: "Glaze is already inactive" });
    }

    glaze.isActive = false;
    await glaze.save();

    await logEvent({
      event: "glaze_deactivated",
      objectId: glaze._id,
      description: `Glaze ${glaze.name} marked as inactive`,
      req,
    });

    res.json({ message: "Glaze deactivated" });
  } catch (err) {
    res.status(500).json({ error: "Error deactivating glaze" });
  }
}; // end deactivateGlaze

module.exports = {
  createGlaze,
  getGlazeById,
  getGlazes,
  updateGlaze,
  deactivateGlaze,
};
