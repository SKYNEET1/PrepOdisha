const { generateOTPToken } = require("../utils/jwt");
const { hmacotp, timingSafeEqualHex } = require("../utils/OTPcreation");
const redis = require("../config/redisSetUp");
const client = redis();
const { KEYS } = require("../service/cacheService");

exports.verifyOTP = async (req, res, next) => {

    try {

        const { otp, email } = req.body;
        if (!otp || !email) {
            return res.status(400).json({
                success: false,
                message: "OTP and email required"
            });
        }

        const key = KEYS('otp', 'data', email);
        const attemptsKey = KEYS('otp', 'attempt', email);
        const noOfAttempt = await client.get(attemptsKey);
        const storedHotp = await client.hget(key, 'hash');
        if (!storedHotp) {
            return res.status(400).json({
                success: false,
                message: "OTP expired or not found"
            });
        }

        const newOtpHash = hmacotp(otp, email);
        if (!newOtpHash) {
            return res.status(400).json({
                success: false,
                message: "New OTP could not be encrypted"
            });
        }

        const isValid = timingSafeEqualHex(storedHotp, newOtpHash);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid OTP"
            });
        }
        // await client.incr(attemptsKey);
        console.log("OTP verified successfully, No of attempt : ", noOfAttempt);
        next();

    } catch (error) {

        console.error("Error in OTP verification", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Server error",
        });

    }

}