import React from 'react';
import { FaArrowRight, FaRecycle, FaLeaf, FaGlobe } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const Hero = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const heroStyle = {
    backgroundImage: `url('/waste-services1.jpg')`,
  };

  return (
    <section
      className="relative min-h-screen bg-gradient-to-br from-green-500 to-blue-600 flex items-center text-white"
      style={heroStyle}
    >
      {/* Gradient Overlay */}
      <div className={`absolute inset-0 transition-colors duration-500 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900/95 via-emerald-900/90 to-teal-900/95'
          : 'bg-gradient-to-br from-emerald-900/90 via-purple-900/85 to-teal-900/90'
      }`}></div>
      
      {/* Animated Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 animate-pulse">
          <FaRecycle className="text-white text-6xl" />
        </div>
        <div className="absolute bottom-40 right-20 animate-bounce">
          <FaLeaf className="text-white text-5xl" />
        </div>
        <div className="absolute top-1/3 right-1/4 animate-pulse">
          <FaGlobe className="text-white text-7xl" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="text-emerald-200 text-sm font-medium tracking-wide">
              Join 10,000+ eco-warriors making a difference
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight mb-6 animate-slide-up">
            <span className="bg-gradient-to-r from-green-400 via-white-400 to-teal-400 bg-clip-text text-transparent">
              Lets Build a Cleaner Future Together
    </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl lg:text-2xl text-emerald-100 mb-10 max-w-2xl leading-relaxed">
           Take action where it matters. Help clean your city and create lasting impact.
          </p>

        {/* CTA Buttons + Feature Pills (side by side) */}
<div className="flex flex-col lg:flex-row lg:items-center gap-6 mt-10">
  
  {/* ✅ Buttons in one horizontal line */}
  <div className="flex flex-row flex-wrap gap-4">
    <button
      onClick={() => navigate('/register')}
      className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-purple-600 text-white font-bold text-lg py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:from-emerald-600 hover:to-green-700"
    >
      ♻️ Join the Movement
      <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
    </button>
    
    <button
      onClick={() => document.getElementById('pickup')?.scrollIntoView({ behavior: 'smooth' })}
      className="inline-flex items-center justify-center gap-3 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white font-bold text-lg py-4 px-8 rounded-full transition-all duration-300 hover:bg-white/20 hover:border-white/50"
    >
      🗓️ Book a Pickup
    </button>
  </div>

  {/* Pills beside buttons */}
  <div className="flex flex-wrap gap-3 justify-center lg:justify-start lg:ml-8">
    {['♻️ Zero-Waste Mission', '🚛 Fast & Free Pickups', '🌍 Verified Eco Partners', '👥 10K+ Volunteers'].map((feature, index) => (
      <div
        key={index}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 text-sm text-emerald-200 font-medium"
      >
        {feature}
      </div>
    ))}
  </div>

</div>

</div>
</div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
