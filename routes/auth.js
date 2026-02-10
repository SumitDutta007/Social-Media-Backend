const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { generateToken } = require("../middleware/auth");

// REGISTER - Create new user account
router.post("/register", async (req, res) => {
  try {
    // Validation
    if (!req.body.username || !req.body.email || !req.body.password) {
      return res.status(400).json({ 
        error: "Validation failed",
        message: "Username, email, and password are required" 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { username: req.body.username },
        { email: req.body.email }
      ]
    });

    if (existingUser) {
      return res.status(409).json({ 
        error: "User already exists",
        message: "Username or email is already registered" 
      });
    }

    // Generate bcrypted password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    // Create new user
    const newUser = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: hashPassword,
      isAdmin: req.body.isAdmin || false, // Default to regular user
    });

    // Generate JWT token
    const token = generateToken(newUser._id, newUser.isAdmin);

    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    // Send response
    res.status(201).json({
      message: "User registered successfully",
      user: userResponse,
      token: token
    });
  } catch (err) {
    console.log("Error: ", err.message);
    res.status(500).json({ 
      error: "Registration failed",
      message: err.message 
    });
  }
});

// LOGIN - Authenticate user
router.post("/login", async (req, res) => {
  try {
    // Validation
    if (!req.body.username || !req.body.password) {
      return res.status(400).json({ 
        error: "Validation failed",
        message: "Username and password are required" 
      });
    }

    // Find user
    const user = await User.findOne({ username: req.body.username });

    if (!user) {
      return res.status(404).json({
        error: "Authentication failed",
        message: "Username not found"
      });
    }

    // Validate password
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!validPassword) {
      return res.status(401).json({
        error: "Authentication failed",
        message: "Invalid password"
      });
    }

    // Generate JWT token
    const token = generateToken(user._id, user.isAdmin);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    // Send response
    res.status(200).json({
      message: "Login successful",
      user: userResponse,
      token: token
    });
  } catch (err) {
    console.log("Error: ", err.message);
    res.status(500).json({ 
      error: "Login failed",
      message: err.message 
    });
  }
});

module.exports = router;
