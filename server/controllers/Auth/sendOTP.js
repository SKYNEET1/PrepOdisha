// Send OTP For Email Verification

const User = require("../../models/User");
const { generateOTP, hmacotp } = require("../../utils/OTPcreation");
const { KEYS } = require("../../service/cacheService");
const redisSetUp = require("../../config/redisSetUp");
const sendOTPMail = require("../../service/mail");
const client = redisSetUp();

exports.sendotp = async (req, res) => {
  try {

    const { email } = req.body;

    // Check if user is already present
    // Find user with provided email
    const checkUserPresent = await User.findOne({ email }).lean();
    console.log('checkUserPresent',checkUserPresent)
    // to be used in case of signup

    // If user found with provided email
    if (checkUserPresent) {
      // Return 401 Unauthorized status code with error message
      return res.status(401).json({
        success: false,
        message: `User is Already Registered`,
      });
    }

    const cooldown_key = KEYS('otp', 'cooldown', email);
    const cooldown_TTL = await client.ttl(cooldown_key);
    if (cooldown_TTL > 0) {
      return res.status(429).json({
        success: false,
        message: `Please wait ${cooldown_TTL} seconds before requesting OTP again`
      });
    }

    const attempt_key = KEYS('otp', 'attempt', email);
    const attempt = await client.get(attempt_key) || 0;

    if (Number(attempt) >= 5) {
      return res.status(403).json({
        success: false,
        message: "You have exceeded the maximum OTP requests today"
      });
    }

    // generate otp
    const otp = generateOTP();
    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP generation error"
      });
    }

    const hOtp = hmacotp(otp, email);
    if (!hOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP encryption error"
      });
    }

    const key = KEYS('otp', 'data', email);
    const ttl = 10 * 60;

    await client
      .multi()
      .hset(key, "hash", hOtp)
      .expire(key, ttl)
      .exec();

    await client.incr(attempt_key);
    await client.expire(attempt_key, 24 * 60 * 60);
    await client.set(cooldown_key, 1, "EX", 2 * 60);

    console.log("Generated OTP (only show in development):", otp);
    await sendOTPMail(email, otp);

    res.status(200).json({
      success: true,
      message: `OTP Sent Successfully`,
    });

  } catch (error) {

    console.log(error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }

};
