// Import the required modules
const express = require("express")
const router = express.Router()

// Import the Controllers

// Course Controllers Import
const { createCourse } = require("../controllers/Course/createCourse");
const { getAllCourses } = require("../controllers/Course/getAllCourses");
const { getCourseDetails } = require("../controllers/Course/getCourseDetails");
const { getFullCourseDetails } = require("../controllers/Course/getFullCourseDetails");
const { editCourse } = require("../controllers/Course/editCourse");
const { getInstructorCourses } = require("../controllers/Course/getInstructorCourses");
const { deleteCourse } = require("../controllers/Course/deleteCourse");


// Categories Controllers Import
const { showAllCategories } = require("../controllers/Category/showAllCategories");
const { createCategory } = require("../controllers/Category/createCategory");
const { categoryPageDetails } = require("../controllers/Category/categoryPageDetails");

// Sections Controllers Import
const { createSection } = require("../controllers/Section/createSection");
const { updateSection } = require("../controllers/Section/updateSection");
const { deleteSection } = require("../controllers/Section/deleteSection");

// Sub-Sections Controllers Import
const { createSubSection } = require("../controllers/Subsection/createSubSection");
const { updateSubSection } = require("../controllers/Subsection/updateSubSection");
const { deleteSubSection } = require("../controllers/Subsection/deleteSubSection");

// Rating Controllers Import
const { createRating } = require("../controllers/RatingAndReview/createRating");
const { getAverageRating } = require("../controllers/RatingAndReview/getAverageRating");
const { getAllRating } = require("../controllers/RatingAndReview/getAllRating");

const { updateCourseProgress } = require("../controllers/courseProgress/updateCourseProgress");;

// Importing Middlewares
const { auth } = require("../middlewares/auth");
const { isInstructor, isStudent, isAdmin } = require("../middlewares/authrisedUser");
const { validateRequest } = require("../middlewares/validateRequest")

// Importing Validators
const {
  createCourseValidation,
  createSectionValidation,
  createSubSectionValidation,
  createCategoryValidation
} = require("../validations/courseValidation")

// ********************************************************************************************************
//                                      Course routes
// ********************************************************************************************************

// Courses can Only be Created by Instructors
router.post("/createCourse", auth, isInstructor, createCourseValidation, validateRequest, createCourse)
//Add a Section to a Course
router.post("/addSection", auth, isInstructor, createSectionValidation, validateRequest, createSection)
// Update a Section
router.post("/updateSection", auth, isInstructor, updateSection)
// Delete a Section
router.post("/deleteSection", auth, isInstructor, deleteSection)
// Edit Sub Section
router.post("/updateSubSection", auth, isInstructor, updateSubSection)
// Delete Sub Section
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection)
// Add a Sub Section to a Section
router.post("/addSubSection", auth, isInstructor, createSubSectionValidation, validateRequest, createSubSection)
// Get all Registered Courses
router.get("/getAllCourses", getAllCourses)
// Get Details for a Specific Courses
router.post("/getCourseDetails", getCourseDetails)
// Get Details for a Specific Courses
router.post("/getFullCourseDetails", auth, getFullCourseDetails)
// Edit Course routes
router.post("/editCourse", auth, isInstructor, editCourse)
// Get all Courses Under a Specific Instructor
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses)
// Delete a Course
router.delete("/deleteCourse", deleteCourse)

router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress);

// ********************************************************************************************************
//                                      Category routes (Only by Admin)
// ********************************************************************************************************
// Category can Only be Created by Admin
// TODO: Put IsAdmin Middleware here
router.post("/createCategory", auth, isAdmin, createCategoryValidation, validateRequest, createCategory)
router.get("/showAllCategories", showAllCategories)
router.post("/getCategoryPageDetails", categoryPageDetails)

// ********************************************************************************************************
//                                      Rating and Review
// ********************************************************************************************************
router.post("/createRating", auth, isStudent, createRating)
router.get("/getAverageRating", getAverageRating)
router.get("/getReviews", getAllRating)

module.exports = router