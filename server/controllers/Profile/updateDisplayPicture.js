const Profile = require("../../models/Profile")
const CourseProgress = require("../../models/CourseProgress")

const Course = require("../../models/Course")
const User = require("../../models/User")
const { uploadImageToCloudinary } = require("../../utils/imageUploader")
const mongoose = require("mongoose")
const { convertSecondsToDuration } = require("../../utils/secToDuration")
// Method for updating a profile

exports.updateDisplayPicture = async (req, res) => {
  try {
    if (!req.files || !req.files.displayPicture) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image file",
      });
    }
    const displayPicture = req.files.displayPicture
    const userId = req.user.id
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    )
    console.log(image)
    const updatedProfile = await User.findByIdAndUpdate(
      userId,
      { image: image.secure_url },
      { new: true }
    )
    res.send({
      success: true,
      message: `Image Updated successfully`,
      data: updatedProfile,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

