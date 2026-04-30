const { body } = require("express-validator");

exports.updateProfileValidation = [
    body("firstName").optional().trim().notEmpty().bail().withMessage("First name cannot be empty").isString().withMessage("First name must be a string"),
    body("lastName").optional().trim().notEmpty().bail().withMessage("Last name cannot be empty").isString().withMessage("Last name must be a string"),
    body("dateOfBirth").optional().trim().notEmpty().bail().withMessage("Date of birth cannot be empty").isString().withMessage("Date of birth must be a string"),
    body("about").optional().trim().isString().withMessage("About must be a string"),
    body("contactNumber").optional().trim().notEmpty().bail().withMessage("Contact number cannot be empty").isNumeric().withMessage("Contact number must be a number"),
    body("gender").optional().trim().notEmpty().bail().withMessage("Gender cannot be empty").isString().withMessage("Gender must be a string")
];
