// Login controller for authenticating users


const { generateAccessToken } = require("../../utils/jwt");
const { comparePassword } = require("../../utils/hash");
const User = require("../../models/User");
require("dotenv").config();

exports.login = async (req, res) => {
    try {

        const { email, password } = req.body;

        // Find user with provided email
        const user = await User.findOne({ email }).populate("additionalDetails");

        // If user not found with provided email
        if (!user) {
            // Return 401 Unauthorized status code with error message
            return res.status(401).json({
                success: false,
                message: `User is not Registered with Us Please SignUp to Continue`,
            });
        }

        // Generate JWT token and Compare Password
        if (await comparePassword(password, user.password)) {
            const accessToken = generateAccessToken(
                user.email,
                user._id,
                user.accountType
            );
            // Save token to user document in database
            user.token = accessToken;
            user.password = undefined;

            // Sync with Chat Service
            try {
                const axios = require('axios');
                await axios.post('http://localhost:5001/api/v1/chat/sync-user', {
                    userId: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    image: user.image,
                    accountType: user.accountType
                });
            } catch (chatError) {
                console.error("Failed to sync user with Chat Service:", chatError.message);
                // Don't fail login if chat sync fails
            }

            res.cookie('token', accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: "Strict",
                maxAge: 2 * 60 * 60 * 1000
            });
            return res.status(200).json({
                success: true,
                accessToken,
                token: accessToken,
                user,
                message: `User Login Success`,
            });
        } else {
            return res.status(401).json({
                success: false,
                message: `Password is incorrect`,
            });
        }

    } catch (error) {
        console.error(error);
        // Return 500 Internal Server Error status code with error message
        return res.status(500).json({
            success: false,
            message: `Login Failure Please Try Again`,
        });
    }
};