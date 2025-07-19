const Glaze = require("../models/Glaze");

// Create
const createGlaze = async (req, res) => {
  try {
    const glaze = new Glaze(req.body);
    const saved = await glaze.save();
    res.status(201).json(saved);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error creating glaze", details: err.message });
  }
};

// Read one
const getGlazeById = async (req, res) => {
  try {
    const glaze = await Glaze.findById(req.params.id);
    if (!glaze) return res.status(404).json({ error: "Glaze not found" });
    res.json(glaze);
  } catch (err) {
    res.status(500).json({ error: "Error retrieving glaze" });
  }
};

// Read all
const getGlazes = async (req, res) => {
  try {
    const glazes = await Glaze.find();
    res.json(glazes);
  } catch (err) {
    res.status(500).json({ error: "Error fetching glazes" });
  }
};

// Update
const updateGlaze = async (req, res) => {
  try {
    const updated = await Glaze.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ error: "Glaze not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Error updating glaze" });
  }
};

// Delete
const deleteGlaze = async (req, res) => {
  try {
    const deleted = await Glaze.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Glaze not found" });
    res.json({ message: "Glaze deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting glaze" });
  }
};

module.exports = {
  createGlaze,
  getGlazeById,
  getGlazes,
  updateGlaze,
  deleteGlaze,
};
