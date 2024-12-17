// Sanitation middleware to clean parameters
const { body, param, validationResult } = require("express-validator");

const validateId = (id) => {
  return [
    param(id)
      .trim()
      .escape()
      .isInt({ min: 1 })
      .withMessage(`${id} must be an integer greater than 0`),
  ];
};

const validateProductParams = () => {
  return [
    body("prodName")
      .notEmpty()
      .withMessage("Product name cannot be empty")
      .isString()
      .withMessage("Product name must be a string")
      .trim()
      .escape(),
    body("prodPrice")
      .trim()
      .escape()
      .isInt({ min: 1 })
      .withMessage("Product price must be an integer greater than 0"),
  ];
};

const validateUserLoginParams = () => {
  return [
    body("username")
      .notEmpty()
      .withMessage("Username cannot be empty")
      .isString()
      .withMessage("Username must be a string")
      .trim()
      .escape(),
    body("password")
      .notEmpty()
      .withMessage("Password cannot be empty")
      .isString()
      .withMessage("Password must be a string")
      .trim()
      .escape(),
  ];
};

const validateUserParams = () => {
  return [
    body("username")
      .notEmpty()
      .withMessage("Username cannot be empty")
      .isString()
      .withMessage("Username must be a string")
      .trim()
      .escape(),
    body("email")
      .notEmpty()
      .withMessage("Email cannot be empty")
      .isEmail()
      .trim()
      .escape(),
    body("password")
      .notEmpty()
      .withMessage("Password cannot be empty")
      .isString()
      .withMessage("Password must be a string")
      .trim()
      .escape(),
    body("role")
      .notEmpty()
      .withMessage("Role cannot be empty")
      .isString()
      .withMessage("Role must be a string")
      .trim()
      .escape()
      .customSanitizer((value) => {
        return value.toLowerCase(); // Normalize role to lowercase
      }),
  ];
};

const validateUserUpdateParams = () => {
  return [
    body("username")
      .optional()
      .notEmpty()
      .withMessage("Username cannot be empty")
      .isString()
      .withMessage("Username must be a string")
      .trim()
      .escape(),

    body("email")
      .optional()
      .notEmpty()
      .withMessage("Email cannot be empty")
      .isEmail()
      .withMessage("Must be a valid email")
      .trim()
      .escape(),

    body("password")
      .optional()
      .notEmpty()
      .withMessage("Password cannot be empty")
      .isString()
      .withMessage("Password must be a string")
      .trim()
      .escape(),

    body("role")
      .optional()
      .notEmpty()
      .withMessage("Role cannot be empty")
      .isString()
      .withMessage("Role must be a string")
      .trim()
      .escape()
      .customSanitizer((value) => {
        return value.toLowerCase(); // Normalize role to lowercase
      }),
  ];
};

const validateOrderParams = () => {
  return [
    body("productId")
      .trim()
      .escape()
      .isInt({ min: 1 })
      .withMessage("Product ID must be an integer greater than 0"),
    body("quantity")
      .trim()
      .escape()
      .isInt({ min: 1 })
      .withMessage("Quantity must be an integer greater than 0"),
  ];
};

module.exports = {
  validateId,
  validateProductParams,
  validateUserParams,
  validateUserLoginParams,
  validateOrderParams,
};
