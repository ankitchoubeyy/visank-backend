import jwt from "jsonwebtoken";

/**
 * Generate JWT token for provider
 * @param {string} providerId - MongoDB ObjectId
 */
export function generateToken(providerId) {
  return jwt.sign(
    {
      id: providerId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d", // provider stays logged in
    }
  );
}
