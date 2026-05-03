const Course = require("../../models/Course")
const Category = require("../../models/Category")
const Section = require("../../models/Section")
const SubSection = require("../../models/SubSection")
const User = require("../../models/User")
const { uploadImageToCloudinary } = require("../../utils/imageUploader")
const CourseProgress = require("../../models/CourseProgress")
const { convertSecondsToDuration } = require("../../utils/secToDuration")


// Function to create a new course

exports.getInstructorCourses = async (req, res) => {
  try {
    // Get the instructor ID from the authenticated user or request body
    const instructorId = req.user.id

    // Find all courses belonging to the instructor
    const instructorCourses = await Course.find({
      instructor: instructorId,
    }).sort({ createdAt: -1 })

    // Return the instructor's courses
    res.status(200).json({
      success: true,
      data: instructorCourses,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor courses",
      error: error.message,
    })
  }
}
// Delete the Course
