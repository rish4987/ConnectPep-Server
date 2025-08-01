

const express = require('express');
const authRouter= express.Router();



const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
 const { validateSignup } = require('../utils/validation'); 

const User = require('../models/user');

authRouter.post("/signup", async (req, res) => {
  try {
    console.log("Request body:", req.body);

    const {  firstName,
  lastName,
  email,
  password,
  photoUrl,
  age,
  gender,
  about,
   } = req.body;

    // Validate after extracting values
    validateSignup(req); 


    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
     
       firstName,
  lastName,
  email,
  password,
  photoUrl,
  age,
  gender,
  about,
  
    });

    await user.save();
    res.status(201).json({ message: "User created successfully!", userId: user._id });

  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Failed to create user.", error: error.message });
  }
});


authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required." });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found." });

    const isMatch = await user.validatePassword(password);

    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials." });

    const token = await user.getJWT();

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000
    });

    res.send(user);

  } catch (error) {
    res.status(500).json({ message: "Login failed.", error: error.message });
  }
});


authRouter.post("/logout", async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "Lax",
      maxAge: 0
     
    });

    res.status(200).json({ message: "Logout successful." });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});


module.exports = authRouter;