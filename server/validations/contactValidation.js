const { body } = require("express-validator");

exports.contactUsValidation = [
    body("email").trim().notEmpty().bail().withMessage("Email is required").isString().withMessage("Email must be a string").isEmail().withMessage("Invalid email format"),
    body("firstname").trim().notEmpty().bail().withMessage("First name is required").isString().withMessage("First name must be a string"),
    body("lastname").trim().notEmpty().bail().withMessage("Last name is required").isString().withMessage("Last name must be a string"),
    body("message").trim().notEmpty().bail().withMessage("Message is required").isString().withMessage("Message must be a string"),
    body("phoneNo").trim().notEmpty().bail().withMessage("Phone number is required").isString().withMessage("Phone number must be a string"),
    body("countrycode").trim().notEmpty().bail().withMessage("Country code is required").isString().withMessage("Country code must be a string")
];
