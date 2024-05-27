const { body } = require("express-validator");

//phone number validation
const validatePhoneNum = (value) => {
    if (!/^\d{10}$/.test(value)) {
      throw new Error("Invalid phone number");
    }
    return true;
  };
  

//email validation
const validateEmail = (value) => {
  if (!/^\S+@\S+\.\S+$/.test(value)) {
    throw new Error("Invalid email");
  }
  return true;
};

const validateRegistration = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Invalid email format")
    .bail()
    .custom(validateEmail),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .bail()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("phone")
    .optional()
    .custom(validatePhoneNum)
    .withMessage("Invalid phone number"),
];
module.exports = validateRegistration;
