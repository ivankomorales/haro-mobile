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
    .trim()
    .escape(),

  body("lastName")
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage("Last name must be between 1 and 50 characters")
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/)
    .withMessage("Last name must contain only letters and valid characters")
    .trim()
    .escape(),

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
    .trim()
    .escape(),

  body("lastName")
    .optional()
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/)
    .withMessage("Last name must contain only letters and valid characters")
    .isLength({ min: 1, max: 50 })
    .withMessage("Last name must be between 1 and 50 characters")
    .trim()
    .escape(),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  body("phone")
    .optional()
    .matches(/^[0-9]{10,15}$/)
    .withMessage("Phone must be a valid number"),

  body("notes").optional().trim().escape(),

  body("socialMedia.instagram").optional().trim().escape(),
  body("socialMedia.facebook").optional().trim().escape(),
  body("socialMedia.tiktok").optional().trim().escape(),

  body("address").optional().trim().escape(),
  body("city").optional().trim().escape(),
  body("zip").optional().trim().escape(),
];

// ORDER
const validateOrder = [
  body("customer").notEmpty().withMessage("Customer data is required"),

  body("customer.email")
    .optional()
    .isEmail()
    .withMessage("Customer email is invalid")
    .normalizeEmail(),

  body("customer.name")
    .optional()
    .isLength({ min: 2 })
    .withMessage("Customer name must be at least 2 characters"),

  body("customer.lastName")
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage("Customer last name must be between 1 and 50 characters")
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/)
    .withMessage(
      "Customer last name must contain only letters and valid characters"
    )
    .trim()
    .escape(),

  // Products
  body("products")
    .isArray({ min: 1 })
    .withMessage("At least one product is required"),

  body("products.*.type")
    .notEmpty()
    .withMessage("Product type is required")
    .trim()
    .escape(),

  //Product: Figures quantity
  body("products.*.quantity")
    .isNumeric()
    .withMessage("Product quantity must be a number")
    .toInt(),

  body("products.*.price")
    .isNumeric()
    .withMessage("Product price must be a number")
    .toFloat(),

  body("products.*.description")
    .optional()
    .isLength({ max: 300 })
    .withMessage("Description too long")
    .trim()
    .escape(),

  // Product: glazes
  body("products.*.glazes").optional().isObject(),

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
    .trim()
    .escape(),

  // Product: Images
  body("products.*.images")
    .optional()
    .isArray()
    .withMessage("Images must be an array"),

  body("products.*.images.*")
    .optional()
    .isString()
    .withMessage("Each image must be a string (URL or file name)")
    .trim()
    .escape(),

  // Product: workflowStage
  body("products.*.workflowStage")
    .optional()
    .isIn(["exported", "sculptedPainted", "urgent", "painting", "delivered"])
    .withMessage("Invalid workflow stage"),

  // Product: assignedShippingIndex
  body("products.*.assignedShippingIndex")
    .optional()
    .isInt()
    .withMessage("Assigned shipping index must be an integer")
    .toInt(),

  body("status")
    .notEmpty()
    .isIn(["New", "Pending", "In Progress", "Completed", "Cancelled"])
    .withMessage("Invalid order status"),

  body("deposit")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Deposit must be a positive number"),

  body("notes").optional().trim().escape(),

  body("shipping").optional().isObject(),

  body("shipping.address").optional().trim().escape(),
  body("shipping.city").optional().trim().escape(),
  body("shipping.zip").optional().trim().escape(),
];

// Common
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
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
