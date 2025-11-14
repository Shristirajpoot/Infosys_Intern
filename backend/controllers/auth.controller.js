const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { sendOtpEmail } = require('../utils/mailer');

const dotenv = require('dotenv');
dotenv.config();

// Email sending handled via utils/mailer

// 1. Register (Send OTP)
const register = async (req, res) => {
  try {
    const { name, email, password, role, skills, location, bio } = req.body;

    if (!name || !email || !password || !role || !skills || !location || !bio) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already registered" });
    }


    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Create user in DB with OTP (not verified yet)
    const newUser = await User.create({
      name,
      email,
      password,
      role,
      skills,
      location,
      bio,
      otp,
      otpExpires: Date.now() + 5 * 60 * 1000, // valid for 5 minutes
      isVerified: false
    });

  await sendOtpEmail(email, otp, { title: 'Welcome to WasteZero ♻️', subject: 'Verify your WasteZero account' });

    return res.status(200).json({
      success: true,
      message: "OTP sent to email. Please verify to activate account.",
      email
    });

  } catch (err) {
    console.error("Error in register:", err);
    res.status(500).json({ error: err.message });
  }
};

// 2. Verify OTP (Activate account)
const verifyRegistrationOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();


    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

  res.cookie("token", token, { httpOnly: true, sameSite: 'lax' });
    res.status(200).json({ success: true, message: "Account verified successfully", user });
  } catch (err) {
    console.error("Error in verifyRegistrationOtp:", err); // 👈 Full error
    res.status(500).json({ error: err.message });
  }
};


// 3. Login (only if verified)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "Invalid email or password" });
    if (!user.isVerified) return res.status(403).json({ message: "Please verify your account with OTP first" });

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  res.cookie("token", token, { httpOnly: true, sameSite: 'lax' });

    res.status(200).json({ success: true, user, token });
  } catch (err) {
    console.error("Error in login:", err);
    res.status(500).json({ error: err.message });
  }
};

// 4. Logout
const logout = async (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({ success: true, message: "Logged out successfully" });
};

module.exports = {
  register,
  verifyRegistrationOtp,
  login,
  logout
};
