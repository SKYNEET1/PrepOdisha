// Import the required modules
const express = require("express")
const router = express.Router()

const { capturePayment, verifyPayment, sendPaymentSuccessEmail } = require("../controllers/Payments")
const { auth, isInstructor, isStudent, isAdmin } = require("../middlewares/auth")
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