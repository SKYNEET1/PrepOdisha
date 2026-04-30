const { body } = require("express-validator");

exports.signupValidation = [
    body("firstName").trim().notEmpty().bail().withMessage("First name is required").isString().withMessage("First name must be a string"),
    body("lastName").trim().notEmpty().bail().withMessage("Last name is required").isString().withMessage("Last name must be a string"),
    body("email").trim().notEmpty().bail().withMessage("Email is required").isString().withMessage("Email must be a string").isEmail().withMessage("Invalid email format"),
    body("password").trim().notEmpty().bail().withMessage("Password is required").isString().withMessage("Password must be a string").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("confirmPassword").trim().notEmpty().bail().withMessage("Confirm password is required").isString().withMessage("Confirm password must be a string").custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Password and Confirm Password do not match");
        }
        return true;
    }),
    body("accountType").trim().notEmpty().bail().withMessage("Account type is required").isString().withMessage("Account type must be a string").isIn(["Admin", "Student", "Instructor"]).withMessage("Account type must be Admin, Student, or Instructor"),
    body("otp").trim().notEmpty().bail().withMessage("OTP is required").isString().withMessage("OTP must be a string")
];

exports.loginValidation = [
    body("email").trim().notEmpty().bail().withMessage("Email is required").isString().withMessage("Email must be a string").isEmail().withMessage("Invalid email format"),
    body("password").trim().notEmpty().bail().withMessage("Password is required").isString().withMessage("Password must be a string")
];

exports.sendOtpValidation = [
    body("email").trim().notEmpty().bail().withMessage("Email is required").isString().withMessage("Email must be a string").isEmail().withMessage("Invalid email format")
];

exports.changePasswordValidation = [
    body("oldPassword").trim().notEmpty().bail().withMessage("Old password is required").isString().withMessage("Old password must be a string"),
    body("newPassword").trim().notEmpty().bail().withMessage("New password is required").isString().withMessage("New password must be a string").isLength({ min: 6 }).withMessage("New password must be at least 6 characters")
];

exports.resetPasswordTokenValidation = [
    body("email").trim().notEmpty().bail().withMessage("Email is required").isString().withMessage("Email must be a string").isEmail().withMessage("Invalid email format")
];

exports.resetPasswordValidation = [
    body("password").trim().notEmpty().bail().withMessage("Password is required").isString().withMessage("Password must be a string").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("confirmPassword").trim().notEmpty().bail().withMessage("Confirm password is required").isString().withMessage("Confirm password must be a string").custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Password and Confirm Password do not match");
        }
        return true;
    }),
    body("token").trim().notEmpty().bail().withMessage("Token is required").isString().withMessage("Token must be a string")
];
