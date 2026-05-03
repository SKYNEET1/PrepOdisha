const User = require("../../models/User");
const mailSender = require("../../utils/mailSender");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// Reset Password Token Generation

exports.resetPassword = async (req, res) => {
  try {
    // data fetch
    const { password, token } = req.body;

    // get user details from db using token
    const userDetails = await User.findOne({ token: token });
    if (!userDetails) {
      return res.json({
        success: false,
        message: "Token is Invalid",
      });
    }

    // token ka time xpires
    if (!(userDetails.resetPasswordExpires > Date.now())) {
      return res.status(403).json({
        success: false,
        message: `Token is Expired, Please Regenerate Your Token`,
      });
    }
    // hash password
    const encryptedPassword = await bcrypt.hash(password, 10);

    // password update
    await User.findOneAndUpdate(
      { token: token },
      { password: encryptedPassword },
      { new: true }
    );
    res.json({
      success: true,
      message: `Password Reset Successful`,
    });
  } catch (error) {
    return res.json({
      error: error.message,
      success: false,
      message: `Some Error in Updating the Password`,
    });
  }
};
