const { instance } = require("../../config/razorpay");
const Course = require("../../models/Course");
const crypto = require("crypto");
const User = require("../../models/User");
const mailSender = require("../../utils/mailSender");
const mongoose = require("mongoose");
const {
  courseEnrollmentEmail,
} = require("../../mail/templates/courseEnrollmentEmail");
const { paymentSuccessEmail } = require("../../mail/templates/paymentSuccessEmail");
const CourseProgress = require("../../models/CourseProgress");

// ----------------------
// 1. Capture Payment
// ----------------------

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courses,
    } = req.body;

    const userId = req.user.id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courses || !userId) {
      return res.status(400).json({ success: false, message: "Payment verification failed - missing fields" });
    }

    const signBody = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(signBody)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      await enrollStudents(courses, userId);
      return res.status(200).json({ success: true, message: "Payment Verified and Enrollment Successful" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid Signature - Payment Verification Failed" });
    }

  } catch (error) {
    console.error("Error in verifyPayment:", error);
    return res.status(500).json({ success: false, message: "Server error during payment verification" });
  }
};



// ----------------------
// 3. Send Payment Success Email
// ----------------------
