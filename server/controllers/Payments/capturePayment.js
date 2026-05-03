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

exports.capturePayment = async (req, res) => {
  try {
    // get course id and user id
    const { courses } = req.body;
    const userId = req.user.id;

    // data validation
    if (!courses || courses.length === 0) {
      return res.status(400).json({ success: false, message: "Please provide course IDs" });
    }

    let totalAmount = 0;

    for (const courseId of courses) {
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ 
          success: false, 
          message: "Course not found" });
      }

      // user already pay for the same course
      const uid = new mongoose.Types.ObjectId(userId);
      if (course.studentsEnrolled.includes(uid)) {
        return res.status(400).json({ success: false, message: "Already enrolled in course" });
      }

      totalAmount += course.price;
    }

    // create order
    const options = {
      amount: totalAmount * 100, // Amount in paise
      currency: "INR",
      receipt: `${Math.floor(Math.random() * 1000000)}_${Date.now()}`,
      notes : {
        courses : courses ,
        userId , 
      }
    };

    // initiate the payment using razorpay
    try{
      const paymentResponse = await instance.orders.create(options);
      console.log("Payment Response:", paymentResponse);
  
      return res.status(200).json({
        success: true,
        courseName : courses.courseName , 
        courseDescription : courses.courseDescription , 
        thumbnail : courses.thumbnail ,
        orderId : paymentResponse.id ,
        currency : paymentResponse.currency , 
        amount : paymentResponse.amount , 
        data: paymentResponse,
      });
    }
    catch(err){
      console.error("Error in capturePayment:", err);
      return res.status(500).json({ success: false, message: "Could not initiate order." });
    }

  } catch (error) {
    console.error("Error in capturePayment:", error);
    return res.status(500).json({ success: false, message: "Could not initiate order." });
  }
};



// ----------------------
// 2. Verify Payment
// ----------------------
