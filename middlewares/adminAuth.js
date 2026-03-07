const jwt = require("jsonwebtoken");
const Customer = require("../model/UserModel");

const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Check if token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please provide a token.",
      });
    }

    // 2. Extract and verify token
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Fetch the fresh user from the database
    const userId = decoded.id || decoded._id; 
    
    // We use .select("-password") to ensure we don't accidentally pass the password hash to the next function
    const currentUser = await Customer.findById(userId).select("-password");

    // 4. Ensure user still exists in the database
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "The user belonging to this token no longer exists.",
      });
    }

    // 5. Check their CURRENT role directly from the database
    if (currentUser.role !== "admin" && currentUser.role !== "sub-admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin portal access only.",
      });
    }

    // 6. Attach the fresh, secure user object to the request
    req.user = currentUser;

    // 7. Proceed to the controller
    next();

  } catch (error) {
    // Provide specific feedback if the token simply timed out vs being tampered with
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Your session has expired. Please log in again.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid token. Authentication failed.",
    });
  }
};

module.exports = adminAuth;