const Profile = require("../../models/Profile")
const CourseProgress = require("../../models/CourseProgress")

const Course = require("../../models/Course")
const User = require("../../models/User")
const { uploadImageToCloudinary } = require("../../utils/imageUploader")
const mongoose = require("mongoose")
const { convertSecondsToDuration } = require("../../utils/secToDuration")
// Method for updating a profile

exports.instructorDashboard = async (req, res) => {
  try {
    const courseDetails = await Course.find({ instructor: req.user.id })

    const courseData = courseDetails.map((course) => {
      const totalStudentsEnrolled = course.studentsEnrolled.length
      const totalAmountGenerated = totalStudentsEnrolled * course.price

      // Create a new object with the additional fields
      const courseDataWithStats = {
        _id: course._id,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        // Include other course properties as needed
        totalStudentsEnrolled,
        totalAmountGenerated,
      }

      return courseDataWithStats
    })

    res.status(200).json({ courses: courseData })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}