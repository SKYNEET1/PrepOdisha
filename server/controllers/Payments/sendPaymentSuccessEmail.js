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
        { $push: { studentsEnrolled: userId } },
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
