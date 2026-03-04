const jwt = require("jsonwebtoken");


/**
 * Generate JWT token for provider
 * @param {string} userId - MongoDB ObjectId
 */

module.exports = function generateToken(userId) {
  return jwt.sign(
    {
      id: userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d", // provider stays logged in
    }
  );
}
