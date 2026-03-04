const UserModel = require("../../model/UserModel");

// ========================
// GET PROFILE
// ========================
const getProfile = async (req, res, next) => {
  try {

    const user = await UserModel.findById(req.user.id).select("-password");

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    next(error);
  }
};

// ========================
// UPDATE PROFILE
// ========================
const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, avatar } = req.body;

    const user = await UserModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile };