const { validationResult } = require("express-validator");

exports.validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const extractedErrors = [];
        errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));
        
        return res.status(400).json({
            success: false,
            message: "Validation Error",
            errors: extractedErrors
        });
    }
    next();
};
