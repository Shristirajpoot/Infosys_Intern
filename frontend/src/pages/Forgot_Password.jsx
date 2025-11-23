import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';

function Forgot_Password() {
  const navigate = useNavigate();
  
  // Loading Spinner Component
  const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
  
  const EyeIcon = ({ onClick }) => (
    <svg onClick={onClick} className="w-5 h-5 text-gray-400 dark:text-gray-500 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
    </svg>
  );

  const EyeOffIcon = ({ onClick }) => (
    <svg onClick={onClick} className="w-5 h-5 text-gray-400 dark:text-gray-500 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 .946-3.112 3.586-5.545 6.89-6.334M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18"></path>
    </svg>
  );

  // State
  const [step, setStep] = useState("email"); // "email" | "otp" | "reset"
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [sentOtp] = useState(""); // mock OTP for now
  const [isLoading, setIsLoading] = useState(false);

  const inputs = useRef([]);

  // OTP input handling
  const handleChange = (value, index) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 3) {
        inputs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  // Email validation
  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  // Step 1: Get OTP
  const handleGetOtp = async () => {
    if (!email) {
      const errorMessage = "Email is required";
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }
    if (!validateEmail(email)) {
      const errorMessage = "Please enter a valid email address";
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    try {
      setError("");
      setIsLoading(true);
      await authAPI.sendOtp(email); // 🔗 backend
      toast.success("OTP sent successfully to your email!");
      setStep("otp");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to send OTP";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleSubmitOtp = async () => {
    if (otp.some((digit) => digit === "")) {
      const errorMessage = "Please enter all 4 digits of the OTP";
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    try {
      setError("");
      setIsLoading(true);
      await authAPI.verifyOtp(email, otp.join("")); // 🔗 backend
      toast.success("OTP verified successfully!");
      setStep("reset");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Invalid OTP, please try again";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      const errorMessage = "Both fields are required";
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }
    if (password !== confirmPassword) {
      const errorMessage = "Passwords do not match";
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }
    if (password.length < 6) {
      const errorMessage = "Password must be at least 6 characters";
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    try {
      setError("");
      setIsLoading(true);
      await authAPI.resetPassword(email, password); // 🔗 backend
      
      toast.success("Password reset successful! Redirecting to login...");
      
      // ✅ Redirect user to login page
      setTimeout(() => {
        navigate("/login");
        setStep("email");
        setEmail("");
        setOtp(["", "", "", ""]);
        setPassword("");
        setConfirmPassword("");
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to reset password";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Left Panel: Branding and Features 
        Hidden by default, shown only on large screens (lg:flex) and takes half width on lg screens.
      */}
     {/* LEFT PANEL */}
<div className="w-full lg:w-1/2 hidden lg:flex flex-col justify-between relative bg-gradient-to-br from-indigo-900 via-purple-800 to-fuchsia-700 text-white overflow-hidden">
  
  {/* Animated Background Gradient Overlay */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#a855f733,_transparent_60%),_radial-gradient(circle_at_bottom_right,_#7e22ce33,_transparent_60%)] animate-pulse"></div>

  {/* Abstract texture overlay */}
  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/diamond-upholstery.png')] mix-blend-overlay"></div>
<div className="absolute inset-0 bg-[url('/mission.jpg')] bg-contain bg-no-repeat bg-center opacity-40 pointer-events-none"></div>
  {/* Main Content */}
  <div className="relative z-10 p-12 flex flex-col justify-center h-full">
    
    {/* Logo Section */}
    <div className="flex items-center gap-3 mb-10">
      <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
  <img src="/logo.webp" alt="logo" className="w-8 h-9" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-fuchsia-300 to-indigo-200 bg-clip-text text-transparent">
        WasteZero
      </h1>
    </div>

    {/* Heading + Tagline */}
    <h2 className="text-4xl font-bold leading-tight mb-6">
      Forgot <span className="text-fuchsia-300">Your</span> Password?
      No Worries!
    </h2>
    <p className="text-gray-200 max-w-md text-base mb-10 leading-relaxed">
      We'll help you get back to making a positive environment impact . Follow the simple steps to reset your password Securely
    </p>

    {/* Feature Cards */}
    <div className="grid grid-cols-1 gap-4 max-w-sm">
      {[
        { icon: "📧", title: "Email Verification", desc: "Secure OTP sent to your email" },
        { icon: "🔄", title: "Quick Recovery", desc: "Get back to your account fast" },
        { icon: "🔒", title: "Secure Process", desc: "Your data remains protected" },
      ].map((item, i) => (
        <div key={i} className="flex items-center bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-xl p-4 transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1">
          <div className="text-2xl mr-4">{item.icon}</div>
          <div>
            <h3 className="font-semibold text-white">{item.title}</h3>
            <p className="text-sm text-gray-200">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* Bottom Quote */}
  <div className="relative z-10 text-center pb-6 text-sm text-gray-300 border-t border-white/10 mx-10 pt-4 italic">
    “Together, we rise — one act of care at a time.”
  </div>
</div>
      {/* Right Panel: Password Reset Form 
        Takes full width on all screens (w-full).
      */}
      <div className="w-full lg:w-1/2 bg-gray-50 dark:bg-gray-900 flex flex-col h-screen">
        {/* Fixed Header */}
        <div className="flex-shrink-0 p-4 lg:p-6 pb-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-sm mx-auto">
            <button 
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 text-[#588157] dark:text-green-400 hover:text-[#4f685b] dark:hover:text-green-500 font-medium text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Back to Login
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-6 scrollbar-hide">
          <div className="max-w-sm mx-auto w-full py-6 md:py-10">
            
            {/* Step 1: Email Input */}
            {step === "email" && (
              <div className="space-y-6">
                {/* Form Header */}
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                    Forgot Password
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Enter your registered email address. We'll send you a 4-digit OTP to verify your identity.
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#588157] focus:outline-none text-black dark:text-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleGetOtp}
                  disabled={isLoading}
                  className="w-full py-3 bg-[#588157] text-white rounded-lg font-bold hover:bg-[#4f685b] focus:ring-2 focus:ring-[#588157] focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading && <LoadingSpinner />}
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </div>
            )}

            {/* Step 2: OTP Verification */}
            {step === "otp" && (
              <div className="space-y-6">
                {/* Form Header */}
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Enter OTP</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    We've sent a 4-digit verification code to your email address.
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* OTP Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-3 text-center">Verification Code</label>
                  <div className="flex justify-center gap-3 mb-4">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength="1"
                        value={digit}
                        ref={(el) => (inputs.current[index] = el)}
                        onChange={(e) => handleChange(e.target.value, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className="w-12 h-12 text-center text-lg font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#588157] focus:border-[#588157] focus:outline-none text-black dark:text-white dark:bg-gray-800"
                      />
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmitOtp}
                  disabled={isLoading}
                  className="w-full py-3 bg-[#588157] text-white rounded-lg font-bold hover:bg-[#4f685b] focus:ring-2 focus:ring-[#588157] focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading && <LoadingSpinner />}
                  {isLoading ? 'Verifying OTP...' : 'Verify OTP'}
                </button>
              </div>
            )}

            {/* Step 3: Password Reset */}
            {step === "reset" && (
              <div className="space-y-6">
                {/* Form Header */}
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                    Reset Password
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Create a strong new password (at least 6 characters). Make sure both fields match.
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">New Password</label>
                  <div className="relative"> {/* New relative wrapper for input and icon */}
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full p-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#588157] focus:outline-none text-black dark:text-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400"
                      autoComplete="new-password"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      {showPassword ? (
                        <EyeOffIcon onClick={() => setShowPassword(false)} />
                      ) : (
                        <EyeIcon onClick={() => setShowPassword(true)} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Confirm Password</label>
                  <div className="relative"> {/* New relative wrapper for input and icon */}
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full p-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#588157] focus:outline-none text-black dark:text-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400"
                      autoComplete="new-password"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      {showConfirmPassword ? (
                        <EyeOffIcon onClick={() => setShowConfirmPassword(false)} />
                      ) : (
                        <EyeIcon onClick={() => setShowConfirmPassword(true)} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleResetPassword}
                  disabled={isLoading}
                  className="w-full py-3 bg-[#588157] text-white rounded-lg font-bold hover:bg-[#4f685b] focus:ring-2 focus:ring-[#588157] focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading && <LoadingSpinner />}
                  {isLoading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Forgot_Password;
