const User = require("../../model/UserModel");

// ========================
// ADD ADDRESS
// ========================
const addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    // const newAddress = user.addresses[user.addresses.length - 1];
    const newAddress = {
      fullName: req.body.fullName,
      phone: req.body.phone,
      addressLine1: req.body.addressLine1,
      addressLine2: req.body.addressLine2,
      city: req.body.city,
      state: req.body.state,
      postalCode: req.body.postalCode,
      country: req.body.country || "India",
      isDefault: req.body.isDefault || false,
    };

    console.log(newAddress, "newAddress");

    const response = user.addresses.push(newAddress);

    const updatedUser = await user.save();

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      address: newAddress,
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// GET ADDRESSES
// ========================
const getAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("addresses");

    res.status(200).json({
      success: true,
      addresses: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// UPDATE ADDRESS
// ========================
const updateAddress = async (req, res, next) => {
  try {
    const { addressId } = req.body;

    const user = await User.findById(req.user.id);

    const address = user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found with this id",
      });
    }

    Object.assign(address, req.body);

    await user.save();

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address: address,
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// DELETE ADDRESS
// ========================
const deleteAddress = async (req, res, next) => {
  try {
    const { addressId } = req.body;

    const user = await User.findById(req.user.id);

    const address = user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found with this id",
      });
    }

    address.deleteOne();

    await user.save();

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// GET SINGLE ADDRESS
// ========================
const getSingleAddress = async (req, res, next) => {
  try {
    const { addressId } = req.body;

    const user = await User.findById(req.user.id);

    const address = user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found with this id",
      });
    }

    res.status(200).json({
      success: true,
      address,
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// SET DEFAULT ADDRESS
// ========================
const setDefaultAddress = async (req, res, next) => {
  try {
    const { addressId } = req.body;

    const user = await User.findById(req.user.id);

    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });

    const address = user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found with this id",
      });
    }

    address.isDefault = true;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Default address set successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
  getSingleAddress,
  setDefaultAddress,
};
