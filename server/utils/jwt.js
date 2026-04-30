const jwt = require('jsonwebtoken');

const generateAccessToken = (email, _id, accountType) => {
    return jwt.sign(
        { email, _id, accountType },
        process.env.JWT_KEY,
        { expiresIn: '2h' }
    )
}

const generateOTPToken = (email, otp) => {
    return jwt.sign(
        { email, otp },
        process.env.OTP_TOKEN,
        { expiresIn: '1h' }
    )
}

const generateRefreshToken = (email, _id) => {
    return jwt.sign(
        { email, _id },
        process.env.JWT_REFRESH_KEY,
        { expiresIn: '7d' }
    )
}

module.exports = { generateAccessToken, generateRefreshToken, generateOTPToken }