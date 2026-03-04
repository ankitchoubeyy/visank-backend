const express = require("express");

const customerAuth = require("../../middlewares/customerAuth");

const authRoutes = require("./authRoutes");
// const profileRoutes = require("./profileRoutes");
// const cartRoutes = require("./cartRoutes");
// const wishlistRoutes = require("./wishlistRoutes");

const router = express.Router();


/* -------------------------
   PUBLIC ROUTES
--------------------------*/

router.use("/auth", authRoutes);


/* -------------------------
   PROTECTED ROUTES
--------------------------*/

router.use(customerAuth);

// router.use("/profile", profileRoutes);
// router.use("/cart", cartRoutes);
// router.use("/wishlist", wishlistRoutes);


module.exports = router;