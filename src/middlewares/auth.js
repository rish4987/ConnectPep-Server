
const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

const userAuth = async (req, res, next) => {
  try {
    // ✅ Accept token from cookie or Authorization header
    const token =
      req.cookies.token ||
      (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ") &&
        req.headers.authorization.split(" ")[1]);

    console.log("Extracted token:", token);

    if (!token) {
      console.log("No token found in request cookies or Authorization header.");
      return res.status(401).json({ message: "Unauthorized. Token not provided." });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, JWT_SECRET || 'Dev@tinder$12323');
    const { id } = decoded; // Ensure token is signed with { id: user._id }

    // ✅ Fetch user
    const user = await User.findById(id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized. User not found." });
    }

    // ✅ Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired. Please log in again." });
    }
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Unauthorized. Invalid or expired token." });
  }
};

module.exports = userAuth;
