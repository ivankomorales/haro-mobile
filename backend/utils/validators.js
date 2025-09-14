// utils/validators.js

const { body, validationResult } = require("express-validator");

// USER
const validateUser = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 1, max: 50 })
    .withMessage("Name must be between 1 and 50 characters")
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/)
    .withMessage("Name must contain only letters and valid characters")
    .trim(),

  body("lastName")
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage("Last name must be between 1 and 50 characters")
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/)
    .withMessage("Last name must contain only letters and valid characters")
    .trim(),

  body("email").isEmail().withMessage("Invalid email").normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("role")
    .optional()
    .isIn(["admin", "employee"])
    .withMessage("Invalid role"),
];

// CUSTOMER
const validateCustomer = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/)
    .withMessage("Name must contain only letters and valid characters")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .trim(),

  body("lastName")
    .optional()
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/)
    .withMessage("Last name must contain only letters and valid characters")
    .isLength({ min: 1, max: 50 })
    .withMessage("Last name must be between 1 and 50 characters")
    .trim(),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  body("phone")
    .optional()
    .matches(/^[0-9]{10,15}$/)
    .withMessage("Phone must be a valid number"),

  body("notes").optional().trim(),

  body("socialMedia.instagram").optional().trim(),
  body("socialMedia.facebook").optional().trim(),
  body("socialMedia.tiktok").optional().trim(),

  body("address").optional().trim(),
  body("city").optional().trim(),
  body("zip")
    .optional()
    .trim()
    .isPostalCode("any")
    .withMessage("Zip code must be valid"),
];

// ORDER
const validateOrder = [
  body("customer")
    .notEmpty()
    .withMessage("Customer data is required")
    .isObject()
    .withMessage("Customer must be an object"),

  body("customer.email")
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage("Customer email is invalid")
    .normalizeEmail(),

  body("customer.name")
    .notEmpty()
    .withMessage("Customer first name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters")
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/)
    .withMessage("First name must contain only letters and valid characters")
    .trim(),

  body("customer.lastName")
    .optional({ checkFalsy: true })
    .isLength({ min: 1, max: 50 })
    .withMessage("Last name must be between 1 and 50 characters")
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/)
    .withMessage("Last name must contain only letters and valid characters")
    .trim(),

  // Products
  body("products")
    .isArray({ min: 1 })
    .withMessage("At least one product is required"),

  body("products.*.type")
    .notEmpty()
    .withMessage("Product type is required")
    .trim(),

  //Product: Figures quantity
  body("products.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Product quantity must be an integer >= 1")
    .toInt(),

  body("products.*.price")
    .isNumeric()
    .withMessage("Product price must be a number")
    .toFloat(),

  body("products.*.description")
    .optional()
    .isLength({ max: 300 })
    .withMessage("Description too long")
    .trim(),

  // Product: glazes
  body("products.*.glazes")
    .optional({ nullable: true })
    .custom((value) => value === null || typeof value === "object")
    .withMessage("Glazes must be an object or null"),

  body("products.*.glazes.interior")
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null) return true;
      return /^[a-f\d]{24}$/i.test(value);
    })
    .withMessage("Interior glaze must be a valid ID or null"),

  body("products.*.glazes.exterior")
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null) return true;
      return /^[a-f\d]{24}$/i.test(value);
    })
    .withMessage("Exterior glaze must be a valid ID"),

  // Product: decorations
  body("products.*.decorations").optional().isObject(),

  body("products.*.decorations.hasGold")
    .optional()
    .isBoolean()
    .withMessage("hasGold must be a boolean"),

  body("products.*.decorations.hasName")
    .optional()
    .isBoolean()
    .withMessage("hasName must be a boolean"),

  body("products.*.decorations.decorationDescription")
    .optional()
    .isLength({ max: 300 })
    .trim(),

  // Product: Images (array of objects)
  body("products.*.images")
    .optional()
    .isArray()
    .withMessage("Images must be an array"),

  // Each image object
  body("products.*.images.*.url")
    .notEmpty()
    .withMessage("Image url is required")
    .isString()
    .withMessage("Image url must be a string"),

  body("products.*.images.*.alt")
    .optional()
    .isString()
    .withMessage("Image alt must be a string"),

  body("products.*.images.*.publicId")
    .optional()
    .isString()
    .withMessage("publicId must be a string"),

  body("products.*.images.*.width")
    .optional()
    .isInt({ min: 1 })
    .withMessage("width must be a positive integer"),

  body("products.*.images.*.height")
    .optional()
    .isInt({ min: 1 })
    .withMessage("height must be a positive integer"),

  body("products.*.images.*.format")
    .optional()
    .isString()
    .withMessage("format must be a string"),

  body("products.*.images.*.bytes")
    .optional()
    .isInt({ min: 0 })
    .withMessage("bytes must be a non-negative integer"),

  body("products.*.images.*.primary")
    .optional()
    .isBoolean()
    .withMessage("primary must be a boolean"),

  // Product: workflowStage
  body("products.*.workflowStage")
    .optional()
    .isIn(["none", "exported", "sculpted_painted", "painting", "delivered"])
    .withMessage("Invalid workflow stage"),

  // Product: assignedShippingIndex
  body("products.*.assignedShippingIndex")
    .optional()
    .isInt()
    .withMessage("Assigned shipping index must be an integer")
    .toInt(),

  // Order status
  body("status")
    .notEmpty()
    .isIn(["new", "pending", "inProgress", "completed", "cancelled"])
    .withMessage("Invalid order status"),

  body("deposit")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Deposit must be a positive number"),

  body("notes").optional().trim(),

  body("shipping").optional().isObject(),

  body("shipping.address").optional().trim(),
  body("shipping.city").optional().trim(),
  body("shipping.zip").optional().trim(),
];

// Common
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.warn("🔴 Validation failed with errors:");
    console.table(errors.array());
    return res
      .status(400)
      .json({ message: "Validation error", errors: errors.array() });
  }
  next();
};

module.exports = {
  validateUser,
  validateCustomer,
  validateOrder,
  handleValidationErrors,
};
