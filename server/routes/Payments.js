// Import the required modules
const express = require("express")
const router = express.Router()

const { capturePayment } = require("../controllers/Payments/capturePayment");
const { verifyPayment } = require("../controllers/Payments/verifyPayment");
const { sendPaymentSuccessEmail } = require("../controllers/Payments/sendPaymentSuccessEmail");
const { auth } = require("../middlewares/auth");
const { isInstructor, isStudent, isAdmin } = require("../middlewares/authrisedUser");
const { validateRequest } = require("../middlewares/validateRequest")
const { 
    capturePaymentValidation, 
    verifyPaymentValidation, 
    sendPaymentSuccessEmailValidation 
} = require("../validations/paymentValidation")

router.post("/capturePayment", auth, isStudent, capturePaymentValidation, validateRequest, capturePayment)
router.post("/verifyPayment", auth, isStudent, verifyPaymentValidation, validateRequest, verifyPayment)
router.post("/sendPaymentSuccessEmail", auth, isStudent, sendPaymentSuccessEmailValidation, validateRequest, sendPaymentSuccessEmail);

module.exports = router