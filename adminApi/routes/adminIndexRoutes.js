const express = require("express");
const router = express.Router();
const authRoutes = require("./adminAuthRoutes");

// Admin authentication routes
router.use("/auth", authRoutes);

module.exports = router;