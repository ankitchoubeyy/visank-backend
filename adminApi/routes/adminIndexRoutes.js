const express = require("express");
const router = express.Router();
const adminAuth = require("../../middlewares/adminAuth");
const authRoutes = require("./adminAuthRoutes");
const categoryRoutes = require("./inventoryManangement/categoryRoutes");
const productRoutes = require("./inventoryManangement/productRoutes");

// Admin authentication routes
router.use("/auth", authRoutes);

// Protected routes
router.use(adminAuth);

router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
module.exports = router;