const express = require("express");
const router = express.Router();

const { updateProfile, getProfile } = require("../controllers/userProfileController");

router.get("/", getProfile);
router.post("/", updateProfile);

module.exports = router;