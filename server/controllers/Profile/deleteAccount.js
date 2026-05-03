const Profile = require("../../models/Profile")
const CourseProgress = require("../../models/CourseProgress")

const Course = require("../../models/Course")
const User = require("../../models/User")
const { uploadImageToCloudinary } = require("../../utils/imageUploader")
const mongoose = require("mongoose")
const { convertSecondsToDuration } = require("../../utils/secToDuration")
// Method for updating a profile

exports.deleteAccount = async (req, res) => {
  try {
    // get data
    const id = req.user.id
    console.log(id)
    const user = await User.findById({ _id: id })

    // data validation
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }
    
    // Delete Assosiated Profile with the User
    await Profile.findByIdAndDelete({
      _id: new mongoose.Types.ObjectId(user.additionalDetails),
    })
    for (const courseId of user.courses) {
      await Course.findByIdAndUpdate(
        courseId,
        { $pull: { studentsEnrolled: id } },
        { new: true }
      )
    }
    // Now Delete User
    await User.findByIdAndDelete({ _id: id })
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    })
    await CourseProgress.deleteMany({ userId: id })
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ success: false, message: "User Cannot be deleted successfully" })
  }
}

