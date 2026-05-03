const express = require("express")
const router = express.Router()
const { auth } = require("../middlewares/auth");
const { isInstructor } = require("../middlewares/authrisedUser");
const { deleteAccount } = require("../controllers/Profile/deleteAccount");
const { updateProfile } = require("../controllers/Profile/updateProfile");
const { getAllUserDetails } = require("../controllers/Profile/getAllUserDetails");
const { updateDisplayPicture } = require("../controllers/Profile/updateDisplayPicture");
const { getEnrolledCourses } = require("../controllers/Profile/getEnrolledCourses");
const { instructorDashboard } = require("../controllers/Profile/instructorDashboard");;
console.log({
  deleteAccount,
  updateProfile,
  getAllUserDetails,
  updateDisplayPicture,
  getEnrolledCourses,
  instructorDashboard,
});

const { validateRequest } = require("../middlewares/validateRequest");
const { updateProfileValidation } = require("../validations/profileValidation");

// ********************************************************************************************************
//                                      Profile routes
// ********************************************************************************************************
// Delet User Account
router.delete("/deleteProfile", auth, deleteAccount)
router.put("/updateProfile", auth, updateProfileValidation, validateRequest, updateProfile)
router.get("/getUserDetails", auth, getAllUserDetails)
// Get Enrolled Courses
router.get("/getEnrolledCourses", auth, getEnrolledCourses)
router.put("/updateDisplayPicture", auth, updateDisplayPicture)
router.get("/instructorDashboard", auth, isInstructor, instructorDashboard)

module.exports = router