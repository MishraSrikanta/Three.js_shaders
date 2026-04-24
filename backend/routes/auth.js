const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

/* ================= REGISTER ================= */
router.post("/register", async (req, res) => {
  try {
    const { userId, name, email, phone, password } = req.body;

    if (!userId || !email || !password) {
      return res.status(400).json({ message: "userId, email, and password are required" });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { userId }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      userId,
      name,
      email,
      phone,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    console.log("Login attempt:", req.body);
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({ message: "userId and password are required" });
    }

    const user = await User.findOne({ userId });
    console.log("User Details:", user);
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password Match:", password, user.password, isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token, user });
  } catch (error) {
    console.error(error); // VERY IMPORTANT
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
