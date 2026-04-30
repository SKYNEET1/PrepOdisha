const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const crypto = require("crypto");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const mongoose = require("mongoose");
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail");
const CourseProgress = require("../models/CourseProgress");

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
      if (course.studentsEnroled.includes(uid)) {
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
        courseName : course.courseName , 
        courseDescription : course.courseDescription , 
        thumbnail : course.thumbnail ,
        orderId : paymentResponse.id ,
        currency : paymentResponse.currency , 
        amount : paymentResponse.amount , 
        data: paymentResponse,
      });
    }
    catch(err){
      console.error("Error in capturePayment:", error);
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
exports.sendPaymentSuccessEmail = async (req, res) => {
  try {
    const { orderId, paymentId, amount } = req.body;
    const userId = req.user.id;

    if (!orderId || !paymentId || !amount || !userId) {
      return res.status(400).json({ success: false, message: "Please provide all payment details" });
    }

    const enrolledStudent = await User.findById(userId);
    if (!enrolledStudent) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await mailSender(
      enrolledStudent.email,
      "Payment Received",
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    );

    return res.status(200).json({ success: true, message: "Payment success email sent" });

  } catch (error) {
    console.error("Error in sendPaymentSuccessEmail:", error);
    return res.status(500).json({ success: false, message: "Could not send email" });
  }
};



// ----------------------
// 4. Enroll Students
// ----------------------
const enrollStudents = async (courses, userId) => {
  
  for (const courseId of courses) {
    try {
      // find the cours and enroll the student in it
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentsEnroled: userId } },
        { new: true }
      );

      if (!enrolledCourse) {
        console.error(`Course not found for enrollment: ${courseId}`);
        continue;
      }

      const courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId: userId,
        completedVideos: [],
      });

      // find the student and add course to list enrolled courses me
      const enrolledStudent = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            courses: courseId,
            courseProgress: courseProgress._id,
          },
        },
        { new: true }
      );

      await mailSender(
        enrolledStudent.email,
        `Successfully Enrolled into ${enrolledCourse.courseName}`,
        courseEnrollmentEmail(
          enrolledCourse.courseName,
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
        )
      );

      console.log(`Enrollment complete for student ${userId} in course ${courseId}`);

    } catch (error) {
      console.error(`Error enrolling in course ${courseId}:`, error.message);
    }
  }
};
