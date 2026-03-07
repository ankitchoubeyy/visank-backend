const User = require("../../model/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const generateToken = require("../../utils/generateToken");

// ===========================
// ADMIN AUTH CONTROLLER
// ===========================
const registerAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Check if admin already exists
    if (role === "admin") {
      const adminExists = await User.findOne({ role: "admin" });

      if (adminExists) {
        return res.status(400).json({
          success: false,
          message: "Admin already exists",
        });
      }
    }

    // Check if email already used
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin / sub-admin
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role || "sub-admin",
      emailVerified: true,
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===========================
// ADMIN LOGIN
// ===========================
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin/sub-admin
    const user = await User.findOne({ email }).select("+password");

    if (!user || (user.role !== "admin" && user.role !== "sub-admin")) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { registerAdmin, loginAdmin }; 
