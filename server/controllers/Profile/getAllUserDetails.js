const Profile = require("../../models/Profile")
const CourseProgress = require("../../models/CourseProgress")

const Course = require("../../models/Course")
const User = require("../../models/User")
const { uploadImageToCloudinary } = require("../../utils/imageUploader")
const mongoose = require("mongoose")
const { convertSecondsToDuration } = require("../../utils/secToDuration")
// Method for updating a profile

exports.getAllUserDetails = async (req, res) => {
  try {
    const {id} = req.body;
    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec()
    console.log(userDetails)
    res.status(200).json({
      success: true,
      message: "User Data fetched successfully",
      data: userDetails,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

