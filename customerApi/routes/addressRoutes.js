const express = require("express");
const router = express.Router();

const {
  addAddress,
  getAddresses,
  getSingleAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} = require("../controllers/addressController");

const validateRequest = require("../../middlewares/validateRequest");

const {
  addressValidation,
  addressIdValidation
} = require("../validators/addressValidator");


// Add Address
router.post(
  "/addAddress",
  addressValidation,
  validateRequest,
  addAddress
);


// Get All Addresses
router.get(
  "/getAlladdress",
  getAddresses
);


// Get Single Address
router.post(
  "/getSingleAddress",
  addressIdValidation,
  validateRequest,
  getSingleAddress
);


// Update Address
router.post(
  "/updateAddress",
  addressIdValidation,
  addressValidation,
  validateRequest,
  updateAddress
);


// Delete Address
router.delete(
  "/deleteAddress",
  addressIdValidation,
  validateRequest,
  deleteAddress
);


// Set Default Address
router.post(
  "/setDefaultAddress",
  addressIdValidation,
  validateRequest,
  setDefaultAddress
);


module.exports = router;