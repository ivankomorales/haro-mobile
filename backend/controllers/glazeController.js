const Glaze = require("../models/Glaze");
const ApiError = require("../utils/ApiError");
const { logEvent } = require("../utils/audit");

// TODO: i18n TEXTS

// ---------------------------------------------
// 🟠 CREATE GLAZE (POST /api/glazes)
// ---------------------------------------------
const createGlaze = async (req, res, next) => {
  const { name, colorHex, code, image } = req.body;

  if (!name || !colorHex) {
    return next(new ApiError("Name and colorHex are required fields", 400));
  }

  try {
    const existing = await Glaze.findOne({ name });
    if (existing) {
      return next(new ApiError("Glaze with that name already exists", 400));
    }

    const glaze = new Glaze({ name, hex: colorHex, code, image });
    const saved = await glaze.save();

    // Log Event
    await logEvent({
      event: "glaze_created",
      objectId: saved._id,
      description: `Glaze ${saved.name} created`,
      req,
    });

    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Error in createGlaze:", err);
    next(new ApiError("Failed to create glaze", 500));
  }
}; // end createGlaze

// ---------------------------------------------
// 🟢 GET ONE GLAZE (GET /api/glazes/:id)
// ---------------------------------------------
const getGlazeById = async (req, res, next) => {
  try {
    const glaze = await Glaze.findById(req.params.id);
    if (!glaze) {
      return next(new ApiError("Glaze not found", 404));
    }
    res.json(glaze);
  } catch (err) {
    next(new ApiError("Failed to retrieve glaze", 500));
  }
}; // end getGlazeById

// ---------------------------------------------
// 🟢 GET ALL GLAZES (GET /api/glazes)
// ---------------------------------------------
const getGlazes = async (req, res, next) => {
  try {
    const includeInactive = req.query.includeInactive === "true";
    const filter = includeInactive ? {} : { isActive: true };

    const glazes = await Glaze.find(filter).sort("name");
    res.json(glazes);
  } catch (err) {
    next(new ApiError("Failed to fetch glazes", 500));
  }
}; // end getGlazes

// ---------------------------------------------
// 🔵 UPDATE GLAZE (PUT /api/glazes/:id)
// ---------------------------------------------
const updateGlaze = async (req, res, next) => {
  try {
    const glaze = await Glaze.findById(req.params.id);
    if (!glaze) {
      return next(new ApiError("Glaze not found", 404));
    }

    const changes = [];

    if (req.body.name && req.body.name !== glaze.name) {
      changes.push(`name: ${glaze.name} → ${req.body.name}`);
      glaze.name = req.body.name;
    }

    if (req.body.colorHex && req.body.colorHex !== glaze.hex) {
      changes.push(`colorHex: ${glaze.hex} → ${req.body.colorHex}`);
      glaze.hex = req.body.colorHex;
    }

    if (req.body.image && req.body.image !== glaze.image) {
      changes.push(`image updated`);
      glaze.image = req.body.image;
    }

    const updated = await glaze.save();

    // Log Event
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
    next(new ApiError("Failed to update glaze", 500));
  }
}; // end updateGlaze

// ---------------------------------------------
// 🟣 DEACTIVATE GLAZE (PATCH /api/glazes/:id/deactivate)
// ---------------------------------------------
const deactivateGlaze = async (req, res, next) => {
  try {
    const glaze = await Glaze.findById(req.params.id);
    if (!glaze) {
      return next(new ApiError("Glaze not found", 404));
    }

    if (!glaze.isActive) {
      return next(new ApiError("Glaze is already inactive", 400));
    }

    glaze.isActive = false;
    await glaze.save();

    // Log Event
    await logEvent({
      event: "glaze_deactivated",
      objectId: glaze._id,
      description: `Glaze ${glaze.name} marked as inactive`,
      req,
    });

    res.json({ message: "Glaze deactivated" });
  } catch (err) {
    next(new ApiError("Failed to deactivate glaze", 500));
  }
}; // end deactivateGlaze

// ---------------------------------------------
// 🟣 ACTIVATE GLAZE (PATCH /api/glazes/:id/activate)
// ---------------------------------------------
const activateGlaze = async (req, res, next) => {
  try {
    const glaze = await Glaze.findById(req.params.id);
    if (!glaze) {
      return next(new ApiError("Glaze not found", 404));
    }

    // If already active, return a 400 to avoid unnecessary writes
    if (glaze.isActive) {
      return next(new ApiError("Glaze is already active", 400));
    }

    // Flip the flag to active
    glaze.isActive = true;
    await glaze.save();

    // Log Event
    await logEvent({
      event: "glaze_activated",
      objectId: glaze._id,
      description: `Glaze ${glaze.name} marked as active`,
      req,
    });

    // Keep response shape simple and consistent
    res.json({ message: "Glaze activated" });
  } catch (err) {
    next(new ApiError("Failed to activate glaze", 500));
  }
}; // end activateGlaze

// ---------------------------------------------
// 📦 EXPORT CONTROLLER METHODS
// ---------------------------------------------
module.exports = {
  createGlaze,
  getGlazeById,
  getGlazes,
  updateGlaze,
  deactivateGlaze,
  activateGlaze,
};
