const ChatUser = require("../models/ChatUser");

exports.syncUser = async (req, res) => {
  try {
    const { userId, firstName, lastName, email, image, accountType } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Check if user exists
    let chatUser = await ChatUser.findOne({ userId });
    
    if (chatUser) {
      // Update existing
      chatUser.firstName = firstName || chatUser.firstName;
      chatUser.lastName = lastName || chatUser.lastName;
      chatUser.email = email || chatUser.email;
      chatUser.image = image || chatUser.image;
      chatUser.accountType = accountType || chatUser.accountType;
      await chatUser.save();
    } else {
      // Create new
      chatUser = await ChatUser.create({
        userId,
        firstName,
        lastName,
        email,
        image,
        accountType
      });
    }

    return res.status(200).json({
      success: true,
      message: "User synced successfully",
      chatUser,
    });
  } catch (error) {
    console.error("syncUser error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
