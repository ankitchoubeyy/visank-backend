const { body, param } = require("express-validator");

// =====================
// ADDRESS VALIDATION
// =====================
exports.addressValidation = [
  body("fullName").trim().notEmpty().withMessage("Full name is required"),

  body("phone")
    .trim()
    .isLength({ min: 10, max: 15 })
    .withMessage("Phone must be 10-15 digits"),

  body("addressLine1")
    .trim()
    .notEmpty()
    .withMessage("Address line 1 is required"),

  body("city").trim().notEmpty().withMessage("City is required"),

  body("state").trim().notEmpty().withMessage("State is required"),

  body("postalCode").trim().notEmpty().withMessage("Postal code is required"),
];

// =====================
// ADDRESS ID VALIDATION
// =====================
exports.addressIdValidation = [
  body("addressId").notEmpty().withMessage("Address ID is required"),
];
