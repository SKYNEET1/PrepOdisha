const { body } = require("express-validator");

exports.signupValidation = [
    body("firstName").trim().notEmpty().withMessage("First name is required"),
    body("lastName").trim().notEmpty().withMessage("Last name is required"),
    body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format"),
    body("password").trim().notEmpty().withMessage("Password is required").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("confirmPassword").trim().notEmpty().withMessage("Confirm password is required").custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Password and Confirm Password do not match");
        }
        return true;
    }),
    body("accountType").optional().isIn(["Student", "Instructor", "Admin"]).withMessage("Invalid account type"),
    body("otp").trim().notEmpty().withMessage("OTP is required")
];

exports.loginValidation = [
    body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format"),
    body("password").trim().notEmpty().withMessage("Password is required")
];

exports.sendOtpValidation = [
    body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format")
];

exports.changePasswordValidation = [
    body("oldPassword").trim().notEmpty().withMessage("Old password is required"),
    body("newPassword").trim().notEmpty().withMessage("New password is required").isLength({ min: 6 }).withMessage("New password must be at least 6 characters")
];

exports.resetPasswordTokenValidation = [
    body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format")
];

exports.resetPasswordValidation = [
    body("password").trim().notEmpty().withMessage("Password is required").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("confirmPassword").trim().notEmpty().withMessage("Confirm password is required").custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Password and Confirm Password do not match");
        }
        return true;
    }),
    body("token").trim().notEmpty().withMessage("Token is required")
];
