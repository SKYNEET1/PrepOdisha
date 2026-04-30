const express = require("express")
const router = express.Router()
const { contactUsController } = require("../controllers/ContactUs")
const { validateRequest } = require("../middlewares/validateRequest")
const { contactUsValidation } = require("../validations/contactValidation")

router.post("/contact", contactUsValidation, validateRequest, contactUsController)

module.exports = router