const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/authMiddleware");

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      birthdate,
      phoneNumber, // <-- The user's phone number from the request
      churchName,
      address,
    } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Create a new user instance
    user = new User({
      name,
      email,
      password,
      birthdate,
      phoneNumber, // <-- CORRECTED: Pass the 'phoneNumber' directly to the model
      churchName,
      address,
      status: "pending",
      isAdmin: false,
    });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    res.status(201).json({
      msg: "Registration successful. Your account is pending admin approval.",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }
    if (user.status !== "approved") {
      return res
        .status(401)
        .json({ msg: "Your account is pending admin approval" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }
    const payload = {
      user: {
        id: user.id,
        isAdmin: user.isAdmin,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET api/auth
// @desc    Get user by token
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// ADMIN ROUTES
router.get("/admin/users", auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ msg: "Admin access denied." });
    }
    const users = await User.find({ status: "pending" }).select("-password");
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.put("/admin/approve/:userId", auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ msg: "Admin access denied." });
    }
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    user.status = "approved";
    await user.save();
    res.json({ msg: "User approved successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
