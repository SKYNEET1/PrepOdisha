const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

// This function is used as middleware to authenticate user requests
exports.auth = async (req, res, next) => {
    try {
        // Extracting JWT from request cookies, body or header
        const authHeader = req.header("Authorization");
        let token =
            req.cookies.token ||
            req.body.token ||
            (authHeader && authHeader.startsWith("Bearer ")
                ? authHeader.replace("Bearer ", "")
                : null);

        if (token === "undefined" || token === "null") {
            token = null;
        }

        // If JWT is missing, return 401 Unauthorized response
        if (!token) {
            return res.status(401).json({ success: false, message: `Token Missing` });
        }

        console.log("Token: ", token);

        try {

            // Verifying the JWT using the secret key stored in environment variables
            const decode = jwt.verify(token, process.env.JWT_KEY);
            if (decode._id && !decode.id) {
                decode.id = decode._id;
            }
            // Storing the decoded JWT payload in the request object for further use
            req.user = decode;
            // If JWT is valid, move on to the next middleware or request handler
            next();

        } catch (error) {

            // If JWT verification fails, return 401 Unauthorized response
            if (error.name === 'TokenExpiredError') {
                return res
                    .status(401)
                    .json({
                        success: false,
                        message: 'Access token expired. Please refresh your token.',
                    });
            } else {
                return res
                    .status(401)
                    .json({
                        success: false,
                        message: "token is invalid",
                        error
                    });
            }

        }

    } catch (error) {
        // If there is an error during the authentication process, return 401 Unauthorized response
        return res.status(401).json({
            success: false,
            message: `Something Went Wrong While Validating the Token`,
        });
    }
};

// Middleware to check if user is a Student
exports.isStudent = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Student") {
            return res.status(401).json({
                success: false,
                message: "This is a protected route for Students only",
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "User role cannot be verified",
        });
    }
};

// Middleware to check if user is an Instructor
exports.isInstructor = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Instructor") {
            return res.status(401).json({
                success: false,
                message: "This is a protected route for Instructors only",
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "User role cannot be verified",
        });
    }
};

// Middleware to check if user is an Admin
exports.isAdmin = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Admin") {
            return res.status(401).json({
                success: false,
                message: "This is a protected route for Admins only",
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "User role cannot be verified",
        });
    }
};