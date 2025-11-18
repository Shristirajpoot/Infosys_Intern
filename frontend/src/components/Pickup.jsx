import React, { useState } from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUser, FaCheckCircle } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';

const Pickup = () => {
  const { isDarkMode } = useTheme();
  // State for form data
  const [formData, setFormData] = useState({
    fullName: '',
    location: '',
    date: '',
    time: '',
    message: ''
  });

  // State for modal visibility and message
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Handles input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Handles form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data Submitted:', formData);
    // Show a success message in the modal
    setModalMessage(`Thank you, ${formData.fullName}! Your pickup has been scheduled for ${formData.date} at ${formData.time}.`);
    setIsModalOpen(true);
    // Reset form fields
    setFormData({
      fullName: '',
      location: '',
      date: '',
      time: '',
      message: ''
    });
  };

  // Closes the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setModalMessage('');
  };

  // Inline style for the background image
  const sectionStyle = {
    backgroundImage: "url('/pickup.jpg')",
  };

  return (
    <>
      <section 
        id="pickup" 
        className="relative min-h-screen bg-cover bg-center flex items-center justify-center p-4 py-24"
        style={sectionStyle}
      >
        {/* Gradient Overlay */}
        <div className={`absolute inset-0 transition-colors duration-500 ${
          isDarkMode
            ? 'bg-gradient-to-br from-gray-950/95 via-gray-900/90 to-emerald-950/95'
            : 'bg-gradient-to-br from-emerald-900/90 via-purple-900/85 to-teal-900/90'
        }`}></div>
        
        <div className="relative z-10 w-full max-w-6xl">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-6">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-emerald-300 text-sm font-semibold tracking-wide uppercase">Easy Scheduling</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4">
              Schedule a <span className="bg-gradient-to-r from-emerald-300 to-green-300 bg-clip-text text-transparent">Pickup</span>
            </h2>
            <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
              Choose a convenient time and let us handle the rest. It's free, fast, and eco-friendly!
            </p>
          </div>

          {/* Form Container with Glassmorphism */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 sm:p-12 rounded-3xl shadow-2xl">
            <form onSubmit={handleSubmit}>
              {/* Input Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Full Name */}
                <div className="relative group">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-300 text-lg" />
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl placeholder:text-emerald-200/70 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white/15 transition-all duration-300"
                  />
                </div>

                {/* Location */}
                <div className="relative group">
                  <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-300 text-lg" />
                  <input
                    type="text"
                    name="location"
                    placeholder="Your Location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl placeholder:text-emerald-200/70 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white/15 transition-all duration-300"
                  />
                </div>

                {/* Date */}
                <div className="relative group">
                  <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-300 text-lg" />
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white/15 transition-all duration-300 [color-scheme:dark]"
                  />
                </div>

                {/* Time */}
                <div className="relative group">
                  <FaClock className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-300 text-lg" />
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white/15 transition-all duration-300 [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Textarea */}
              <textarea
                name="message"
                placeholder="Additional details (e.g., type of waste, quantity, special instructions)"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                className="w-full p-4 bg-white/10 border border-white/20 rounded-xl placeholder:text-emerald-200/70 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white/15 resize-none transition-all duration-300 mb-6"
              ></textarea>

              {/* Submit Button */}
              <div className="text-center">
                <button 
                  type="submit" 
                  className="group inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-lg py-4 px-12 rounded-full transition-all duration-300 hover:from-emerald-600 hover:to-green-700 hover:shadow-2xl hover:scale-105"
                >
                  <FaCheckCircle className="text-xl" />
                  Schedule Pickup
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 mt-10 pt-8 border-t border-white/10">
              {['Free Service', 'Same Day Available', 'Eco-Certified', 'Trusted by 10K+'].map((badge, index) => (
                <div key={index} className="flex items-center gap-2 text-emerald-200">
                  <FaCheckCircle className="text-emerald-400" />
                  <span className="text-sm font-medium">{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Success Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl transform animate-scale-up">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCheckCircle className="text-white text-4xl" />
            </div>

            <h3 className="text-3xl font-bold text-gray-900 mb-4">Success!</h3>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">{modalMessage}</p>
            
            <button
              onClick={closeModal}
              className="bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              Got it, Thanks!
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Pickup;

