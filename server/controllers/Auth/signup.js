// Signup Controller for Registering USers

const User = require("../../models/User");
const Profile = require("../../models/Profile");
const { hashPassword } = require("../../utils/hash");
const { hmacotp, timingSafeEqualHex } = require("../../utils/OTPcreation");
const { KEYS } = require("../../service/cacheService");
const getRedisClient = require("../../config/redisSetUp");
const client = getRedisClient();

exports.signup = async (req, res) => {
  try {
    // Destructure fields from the request body
    const {
      firstName,
      lastName,
      email,
      password,
      accountType,
      contactNumber,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please sign in to continue.",
      });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create the Additional Profile For User
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });
    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType: accountType,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    const key = KEYS('otp', 'data', email);
    // Clear OTP from Redis after successful verification
    await client.del(key);

    return res.status(200).json({
      success: true,
      user,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again.",
    });
  }
};