const { body } = require("express-validator");

exports.createCourseValidation = [
    body("courseName").trim().notEmpty().bail().withMessage("Course name is required").isString().withMessage("Course name must be a string"),
    body("courseDescription").trim().notEmpty().bail().withMessage("Course description is required").isString().withMessage("Course description must be a string"),
    body("whatYouWillLearn").trim().notEmpty().bail().withMessage("What you will learn is required").isString().withMessage("What you will learn must be a string"),
    body("price").trim().notEmpty().bail().withMessage("Price is required").isNumeric().withMessage("Price must be a number"),
    body("category").trim().notEmpty().bail().withMessage("Category is required").isString().withMessage("Category must be a string"),
    body("tag").notEmpty().bail().withMessage("Tag is required").isString().withMessage("Tag must be a stringified array"),
    body("instructions").notEmpty().bail().withMessage("Instructions are required").isString().withMessage("Instructions must be a stringified array")
];

exports.createSectionValidation = [
    body("sectionName").trim().notEmpty().bail().withMessage("Section name is required").isString().withMessage("Section name must be a string"),
    body("courseId").trim().notEmpty().bail().withMessage("Course ID is required").isString().withMessage("Course ID must be a string")
];

exports.createSubSectionValidation = [
    body("sectionId").trim().notEmpty().bail().withMessage("Section ID is required").isString().withMessage("Section ID must be a string"),
    body("title").trim().notEmpty().bail().withMessage("Title is required").isString().withMessage("Title must be a string"),
    body("description").trim().notEmpty().bail().withMessage("Description is required").isString().withMessage("Description must be a string")
    // timeDuration might be checked in the controller but let's keep it simple to ensure basic fields are there
];

exports.createCategoryValidation = [
    body("name").trim().notEmpty().bail().withMessage("Category name is required").isString().withMessage("Category name must be a string"),
    body("description").trim().notEmpty().bail().withMessage("Category description is required").isString().withMessage("Category description must be a string")
];
