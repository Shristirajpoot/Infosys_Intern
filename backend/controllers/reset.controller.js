// controllers/reset.controller.js
const nodemailer = require("nodemailer");
const User = require('../models/user.model');
const dotenv = require('dotenv');
dotenv.config();

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Helper function to clean up expired OTPs
const cleanupExpiredOTP = async (user) => {
  if (user.otpExpires && new Date() > user.otpExpires) {
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    return true; // OTP was expired and cleaned
  }
  return false; // OTP is still valid
};

//  1. Send OTP (with email verification)
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email address" });
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 min expiry
    await user.save();

    try {
      // Try to send email
      await transporter.sendMail({
        from: `"WasteZero Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "WasteZero - Your Password Reset OTP",
        html: `
          <div style="font-family: Arial, sans-serif; background: #f9fafb; padding: 30px; text-align: center;">
            <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
              
              <div style="margin-bottom: 20px;">
                <div style="font-size: 50px;">♻️</div>
                <h2 style="margin: 10px 0; color: #2f855a; font-size: 24px; font-weight: bold;">WasteZero</h2>
              </div>

              <h3 style="color: #111827; font-size: 20px; margin-bottom: 10px;">Password Reset Request</h3>
              <p style="color: #374151; font-size: 14px; margin-bottom: 25px;">
                We received a request to reset your WasteZero account password. 
                Please use the OTP below to continue. It is valid for the next <b>5 minutes</b>.
              </p>

              <div style="background: #ecfdf5; color: #065f46; font-size: 24px; font-weight: bold; padding: 15px; border-radius: 8px; letter-spacing: 6px; margin-bottom: 25px;">
                ${otp}
              </div>

              <p style="color: #374151; font-size: 14px; margin-bottom: 20px;">
                If you didn't request this, you can safely ignore this email. 
                Your account remains secure.
              </p>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />
              <p style="font-size: 12px; color: #6b7280;">
                ♻️ Thank you for being part of the <b>WasteZero</b> movement. Together, we're making cities greaner and cleaner.
              </p>
            </div>
          </div>
        `
      });

      console.log(`Password reset OTP sent successfully to ${email}: ${otp}`);
      res.json({
        success: true,
        message: "Password reset OTP sent to your email address",
        email: email
      });
    } catch (emailError) {
      console.log("Email sending failed:", emailError.message);
      console.log(`Development OTP for ${email}: ${otp}`);
      // For development purposes, still allow the process to continue
      res.json({
        success: true,
        message: "OTP generated. Check server console for OTP (email service may be unavailable)",
        email: email
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log(err);
  }
};

//  2. Verify OTP (enhanced validation)
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    if (otp.length !== 4 || !/^\d{4}$/.test(otp)) {
      return res.status(400).json({ message: "OTP must be a 4-digit number" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.otp || !user.otpExpires) {
      return res.status(400).json({ message: "No OTP found. Please request a new one" });
    }

    if (user.otpExpires < Date.now()) {
      // Clean up expired OTP
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();
      return res.status(400).json({ message: "OTP has expired. Please request a new one" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP. Please check and try again" });
    }

    // OTP is valid - clear it to allow password reset
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "OTP verified successfully. You can now reset your password"
    });
  } catch (err) {
    console.error("Error in verifyOtp:", err);
    res.status(500).json({ error: err.message });
  }
};

//  3. Reset Password (enhanced validation)
const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify that OTP was verified (security check)
    if (user.otp || user.otpExpires) {
      // If OTP still exists, it means verification step was skipped
      return res.status(403).json({ message: "Please verify your email with OTP first" });
    }

    // Set the password directly - let the user model's pre-save middleware handle hashing
    user.password = password;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successful. You can now login with your new password"
    });
  } catch (err) {
    console.error("Error in resetPassword:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  resetPassword
};
