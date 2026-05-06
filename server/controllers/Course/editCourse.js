const Course = require("../../models/Course")
const Category = require("../../models/Category")
const Section = require("../../models/Section")
const SubSection = require("../../models/SubSection")
const User = require("../../models/User")
const { uploadImageToCloudinary } = require("../../utils/imageUploader")
const CourseProgress = require("../../models/CourseProgress")
const { convertSecondsToDuration } = require("../../utils/secToDuration")


// Function to create a new course

exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.body
    const updates = req.body
    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json({ error: "Course not found" })
    }

    // If Thumbnail Image is found, update it
    if (req.files) {
      console.log("thumbnail update")
      const thumbnail = req.files.thumbnailImage
      const thumbnailImage = await uploadImageToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      )
      course.thumbnail = thumbnailImage.secure_url
    }

    // Update only the fields that are present in the request body
    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        if (key === "tag" || key === "instructions") {
          course[key] =
            typeof updates[key] === "string"
              ? JSON.parse(updates[key])
              : updates[key]
        } else if (key === "category") {
          // If category is updated, we need to handle the re-association
          if (course.category.toString() !== updates.category.toString()) {
            // Remove from old category
            await Category.findByIdAndUpdate(course.category, {
              $pull: { courses: courseId },
            })
            // Add to new category
            await Category.findByIdAndUpdate(updates.category, {
              $push: { courses: courseId },
            })
          }
          course[key] = updates[key]
        } else {
          course[key] = updates[key]
        }
      }
    }

    await course.save()

    const updatedCourse = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()

    res.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

// Get Course List
