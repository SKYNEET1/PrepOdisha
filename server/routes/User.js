// Import the required modules
const express = require("express")
const router = express.Router()



const {
  resetPasswordToken,
  resetPassword,
} = require("../controllers/ResetPassword")

const { auth } = require("../middlewares/auth")
const { login } = require("../controllers/Auth/login")
const { signup } = require("../controllers/Auth/signup")
const { sendotp } = require("../controllers/Auth/sendOTP")
const { changePassword } = require("../controllers/Auth/changePassword")
const { verifyOTP } = require("../middlewares/verifyOTP")

const { validateRequest } = require("../middlewares/validateRequest");
const { 
  signupValidation, 
  loginValidation, 
  sendOtpValidation, 
  changePasswordValidation, 
  resetPasswordTokenValidation, 
  resetPasswordValidation 
} = require("../validations/authValidation");

// Routes for Login, Signup, and Authentication

// ********************************************************************************************************
//                                      Authentication routes
// ********************************************************************************************************

// Route for user login
router.post("/login", loginValidation, validateRequest, login);

// Route for user signup
router.post("/signup", signupValidation, validateRequest, verifyOTP, signup);

// Route for sending OTP to the user's email
router.post("/sendotp", sendOtpValidation, validateRequest, sendotp);

// Route for Changing the password
router.post("/changepassword", auth, changePasswordValidation, validateRequest, changePassword);

// ********************************************************************************************************
//                                      Reset Password
// ********************************************************************************************************

// Route for generating a reset password token
router.post("/reset-password-token", resetPasswordTokenValidation, validateRequest, resetPasswordToken);

// Route for resetting user's password after verification
router.post("/reset-password", resetPasswordValidation, validateRequest, resetPassword)

// Export the router for use in the main application
module.exports = router