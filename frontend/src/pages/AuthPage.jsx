import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI, resetBlockedUserFlag } from '../services/api';
import { useBlockedUser } from '../contexts/BlockedUserContext';
import { useUser } from '../contexts/UserContext';

// Loading Spinner Component
const LoadingSpinner = () => (
  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const EyeIcon = ({ onClick }) => (
  <svg onClick={onClick} className="w-5 h-5 text-gray-400 dark:text-gray-500 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
  </svg>
);

const EyeOffIcon = ({ onClick }) => (
  <svg onClick={onClick} className="w-5 h-5 text-gray-400 dark:text-gray-500 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 .946-3.112 3.586-5.545 6.89-6.334M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18"></path>
  </svg>
);

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateUser: updateBlockedUser, clearBlockedState } = useBlockedUser();
  const { updateUser, fetchUserProfile } = useUser();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputs = useRef([]);

  useEffect(() => {
    setIsLogin(location.pathname !== '/register');
  }, [location.pathname]);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'volunteer',
    skills: [],
    location: '',
    bio: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setError('');
    setSuccess('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setLoginData({ email: '', password: '' });
    setRegisterData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'volunteer',
      skills: [],
      location: '',
      bio: ''
    });
  }, [isLogin]);

  // OTP input logic
  const handleChange = (value, index) => {
    if (/^\d*$/.test(value)) {
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

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSkillsChange = (e) => {
    const { value, checked } = e.target;
    setRegisterData(prev => ({
      ...prev,
      skills: checked ? [...prev.skills, value] : prev.skills.filter(skill => skill !== value)
    }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await authAPI.login({
        email: loginData.email,
        password: loginData.password
      });

      setSuccess('Login successful! Redirecting...');
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);

      clearBlockedState();
      resetBlockedUserFlag();
      updateBlockedUser(response.user);

      updateUser(response.user);
      fetchUserProfile();

      setTimeout(() => {
        const userRole = response.user?.role;
        if (userRole === 'admin') navigate('/admin');
        else if (userRole === 'volunteer') navigate('/volunteer');
        else if (userRole === 'ngo') navigate('/ngo');
        else navigate('/');
      }, 1500);

    } catch (error) {
      setError(error.response?.data?.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (registerData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await authAPI.register({
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        role: registerData.role,
        skills: registerData.skills,
        location: registerData.location,
        bio: registerData.bio
      });

      setSuccess('OTP sent to your email. Please verify.');
      setIsOtpStep(true);

    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitOtp = async () => {
    const otpCode = otp.join("");
    if (otpCode.length < 4) {
      setError("Please enter the complete 4-digit OTP");
      return;
    }

    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await authAPI.verifyUser({
        email: registerData.email,
        otp: otpCode,
      });

      setSuccess("Account verified! Redirecting...");
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("token", response.token);

      clearBlockedState();
      updateBlockedUser(response.user);

      updateUser(response.user);
      fetchUserProfile();

      setTimeout(() => {
        const userRole = response.user?.role;
        if (userRole === "admin") navigate("/admin");
        else if (userRole === "volunteer") navigate("/volunteer");
        else if (userRole === "ngo") navigate("/ngo");
        else navigate("/");
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setSuccess('');
    try {
      await authAPI.resendOtp({ email: registerData.email });
      setSuccess("New OTP sent to your email.");
    } catch (err) {
      setError("Failed to resend OTP. Please try again later.");
    }
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden">

{/*LEFT PANEL */}
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
      Empower <span className="text-fuchsia-300">Change</span> Together
    </h2>
    <p className="text-gray-200 max-w-md text-base mb-10 leading-relaxed">
      Join a global movement for sustainable living.  
      WasteZero connects people, NGOs, and volunteers to create a cleaner, greener world.
    </p>

    {/* Feature Cards */}
    <div className="grid grid-cols-1 gap-4 max-w-sm">
      {[
        { icon: "🌎", title: "Global Network", desc: "Collaborate with eco-conscious organizations" },
        { icon: "♻️", title: "Innovation", desc: "Drive creative green solutions" },
        { icon: "🤝", title: "Collaboration", desc: "Partner to achieve zero waste goals" },
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



      {/* Right Panel: Login/Register/OTP — Unchanged (your original form code) */}
      <div className="w-full lg:w-1/2 bg-gray-50 dark:bg-gray-900 flex flex-col h-screen">
        <div className="flex-shrink-0 p-4 lg:p-6 pb-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="flex bg-gray-200 dark:bg-gray-800 rounded-lg p-1 w-full max-w-sm mx-auto">
            <button
              onClick={() => {
                setIsLogin(true);
                setIsOtpStep(false);
                navigate('/login');
              }}
              className={`w-1/2 p-2 rounded-md font-semibold transition-all ${
                isLogin
                  ? 'bg-white dark:bg-gray-700 shadow-md text-[#4f685b] dark:text-green-300 font-bold'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setIsOtpStep(false);
                navigate('/register');
              }}
              className={`w-1/2 p-2 rounded-md font-semibold transition-all ${
                !isLogin
                  ? 'bg-white dark:bg-gray-700 shadow-md text-[#4f685b] dark:text-green-300 font-bold'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Register
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 lg:px-6 scrollbar-hide">
          <div className="max-w-lg mx-auto w-full py-4">
            {isLogin && !isOtpStep && (
              <>
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Welcome back!</h2>
                  <p className="text-gray-500 dark:text-gray-400">Sign in to your WasteZero account</p>
                </div>
                {error && (
                  <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/50 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 rounded-lg">
                    {success}
                  </div>
                )}
                <form className="space-y-4" onSubmit={handleLoginSubmit}>
                  <div>
                    <label htmlFor="login-email" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      name="email"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      placeholder="Your email"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#588157] focus:outline-none text-black dark:text-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400"
                      required
                    />
                  </div>
                  <div className="relative">
                    <label htmlFor="login-password" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Password
                    </label>
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      placeholder="Your password"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#588157] focus:outline-none text-black dark:text-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pt-6">
                      <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">
                        {showPassword ? <EyeOffIcon onClick={() => setShowPassword(false)} /> : <EyeIcon onClick={() => setShowPassword(true)} />}
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => navigate('/forgot-password')}
                      className="text-sm text-[#588157] dark:text-green-400 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-[#588157] text-white rounded-lg font-bold hover:bg-[#4f685b] focus:ring-2 focus:ring-[#588157] focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoading && <LoadingSpinner />}
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>
              </>
            )}

            {!isLogin && !isOtpStep && (
              <>
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Create a new account</h2>
                  <p className="text-gray-500 dark:text-gray-400">Fill in your details to join WasteZero</p>
                </div>
                {error && (
                  <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/50 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 rounded-lg">
                    {success}
                  </div>
                )}
                <form className="space-y-3 pb-6" onSubmit={handleRegisterSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="register-name" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Full Name
                      </label>
                      <input
                        id="register-name"
                        type="text"
                        name="name"
                        value={registerData.name}
                        onChange={handleRegisterChange}
                        placeholder="Your full name"
                        className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#588157] focus:outline-none text-black dark:text-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="register-email" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Email
                      </label>
                      <input
                        id="register-email"
                        type="email"
                        name="email"
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        placeholder="Your email"
                        className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#588157] focus:outline-none text-black dark:text-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="register-location" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Location
                    </label>
                    <input
                      id="register-location"
                      type="text"
                      name="location"
                      value={registerData.location}
                      onChange={handleRegisterChange}
                      placeholder="Your location"
                      className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#588157] focus:outline-none text-black dark:text-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="relative">
                      <label htmlFor="register-password" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Password
                      </label>
                      <input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={registerData.password}
                        onChange={handleRegisterChange}
                        placeholder="Create a password"
                        className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#588157] focus:outline-none text-black dark:text-white dark:bg_gray-800 placeholder-gray-500 dark:placeholder-gray-400"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pt-6">
                        <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">
                          {showPassword ? <EyeOffIcon onClick={() => setShowPassword(false)} /> : <EyeIcon onClick={() => setShowPassword(true)} />}
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <label htmlFor="register-confirmPassword" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Confirm Password
                      </label>
                      <input
                        id="register-confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={registerData.confirmPassword}
                        onChange={handleRegisterChange}
                        placeholder="Confirm your password"
                        className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#588157] focus:outline-none text_black dark:text-white dark:bg_gray-800 placeholder-gray-500 dark:placeholder-gray-400"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pt-6">
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label="Toggle confirm password visibility">
                          {showConfirmPassword ? <EyeOffIcon onClick={() => setShowConfirmPassword(false)} /> : <EyeIcon onClick={() => setShowConfirmPassword(true)} />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 !mt-1">*Password must be at least 6 characters long</p>
                  <div>
                    <label htmlFor="register-role" className="block text-sm font_medium text_gray-600 dark:text_gray-300 mb-1">
                      Role
                    </label>
                    <select
                      id="register-role"
                      name="role"
                      value={registerData.role}
                      onChange={handleRegisterChange}
                      className="w-full p-2.5 border border_gray-300 dark:border-gray-600 rounded-lg bg_white dark:bg-gray-800 focus:ring-2 focus:ring-[#588157] focus:outline-none appearance-none text-black dark:text-white"
                      required
                    >
                      <option value="volunteer">Volunteer</option>
                      <option value="admin">Admin</option>
                      <option value="ngo">NGO</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Skills & Interests</label>
                    <div className="grid grid-cols-2 gap-2 max-h-20 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50 scrollbar-hide">
                      {['Waste Collection', 'Recycling Education', 'Community Organizing', 'Environmental Advocacy', 'Data Management', 'Social Media'].map((skill) => (
                        <label key={skill} htmlFor={skill} className="flex items-center space-x-2">
                          <input
                            id={skill}
                            type="checkbox"
                            value={skill}
                            checked={registerData.skills.includes(skill)}
                            onChange={handleSkillsChange}
                            className="form-checkbox text-[#588157] focus:ring-[#588157] w-3 h-3 bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500"
                          />
                          <span className="text-xs text-gray-700 dark:text-gray-300">{skill}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="register-bio" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Bio
                    </label>
                    <textarea
                      id="register-bio"
                      name="bio"
                      value={registerData.bio}
                      onChange={handleRegisterChange}
                      placeholder="Tell us about yourself..."
                      rows="2"
                      className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#588157] focus:outline-none text-black dark:text-white dark:bg_gray-800 placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                      required
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-[#588157] text-white rounded-lg font-bold hover:bg-[#4f685b] focus:ring-2 focus:ring-[#588157] focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoading && <LoadingSpinner />}
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </form>
              </>
            )}

            {isOtpStep && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Enter OTP</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    We've sent a 4-digit verification code to your email address.
                  </p>
                </div>
                {error && (
                  <div className="p-3 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="p-3 bg-green-100 dark:bg-green-900/50 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 rounded-lg text-sm">
                    {success}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-3 text-center">
                    Verification Code
                  </label>
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
                <button
                  onClick={handleSubmitOtp}
                  disabled={isLoading}
                  className="w-full py-3 bg-[#588157] text-white rounded-lg font-bold hover:bg-[#4f685b] focus:ring-2 focus:ring-[#588157] focus:outline-none transition-colors flex items-center justify-center"
                >
                  {isLoading && <LoadingSpinner />}
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="w-full py-2 text-sm text-[#588157] dark:text-green-400 hover:underline mt-2"
                >
                  Resend OTP
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
