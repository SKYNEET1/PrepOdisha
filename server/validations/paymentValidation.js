const { body } = require("express-validator");

exports.capturePaymentValidation = [
    body("courses").notEmpty().bail().withMessage("Please provide course IDs").isArray().withMessage("Courses must be an array")
];

exports.verifyPaymentValidation = [
    body("razorpay_order_id").trim().notEmpty().bail().withMessage("Razorpay order ID is required").isString().withMessage("Razorpay order ID must be a string"),
    body("razorpay_payment_id").trim().notEmpty().bail().withMessage("Razorpay payment ID is required").isString().withMessage("Razorpay payment ID must be a string"),
    body("razorpay_signature").trim().notEmpty().bail().withMessage("Razorpay signature is required").isString().withMessage("Razorpay signature must be a string"),
    body("courses").notEmpty().bail().withMessage("Please provide course IDs").isArray().withMessage("Courses must be an array")
];

exports.sendPaymentSuccessEmailValidation = [
    body("orderId").trim().notEmpty().bail().withMessage("Order ID is required").isString().withMessage("Order ID must be a string"),
    body("paymentId").trim().notEmpty().bail().withMessage("Payment ID is required").isString().withMessage("Payment ID must be a string"),
    body("amount").notEmpty().bail().withMessage("Amount is required").isNumeric().withMessage("Amount must be a number")
];
