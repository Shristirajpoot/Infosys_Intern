import React from 'react';
import { FaTruck, FaRecycle, FaHandsHelping, FaAward, FaArrowRight} from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';

const statsData = [
  {
    label: 'Total Pickups',
    value: '250K+',
    icon: FaTruck,
    color: 'text-emerald-500',
  },
  {
    label: 'Waste Collected',
    value: '745kg',
    icon: FaRecycle,
    color: 'text-teal-500',
  },
  {
    label: 'Active Volunteers',
    value: '1500+',
    icon: FaHandsHelping,
    color: 'text-cyan-500',
  },
  {
    label: 'Opportunities Applied',
    value: '8',
    icon: FaAward,
    color: 'text-blue-500',
  },
];

const imageData = [
  { src: 'waste-services2.jpg', alt: 'Recycling Initiative' },
  { src: 'waste-services3.jpg', alt: 'Waste Sorting Drive' },
  { src: 'img3.png', alt: 'Community Cleanup' },
  { src: 'waste-services1.jpg', alt: 'Cleaning Events' },
];

const ImpactShowcase = () => {
  const { isDarkMode } = useTheme();

  return (
    <section
      className={`w-full py-24 px-4 md:px-12 transition-all duration-500 ${
        isDarkMode
          ? 'bg-gradient-to-b from-slate-900 via-slate-800 to-black'
          : 'bg-gradient-to-b from-white via-purple-500 to-green-300'
      }`}
    >
      {/* Title Section */}
      <div className="text-center max-w-3xl mx-auto mb-20">
        <h2 className={`text-5xl font-extrabold mb-4 leading-tight ${
          isDarkMode ? 'text-white' : 'text-slate-800'
        }`}>
          Impact That <span className="text-emerald-500">Matters</span>
        </h2>
        <p className={`text-lg ${
          isDarkMode ? 'text-slate-300' : 'text-slate-600'
        }`}>
          These milestones are just the beginning. Here's how we've made a difference together.
        </p>
      </div>

      {/* Stats Timeline (Vertical Layout) */}
      <div className="flex flex-col gap-10 max-w-4xl mx-auto relative before:absolute before:left-5 before:top-0 before:bottom-0 before:w-1 before:bg-emerald-500/30">
        {statsData.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="relative pl-16 group">
              <div className="absolute left-1.5 top-1.5 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border-4 border-emerald-500 flex items-center justify-center z-10">
                <Icon className={`${item.color} text-lg`} />
              </div>
              <div className={`p-6 rounded-2xl border-l-4 border-emerald-400 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md shadow-md transition-all duration-300 group-hover:scale-[1.02]`}>
                <h3 className={`text-3xl font-bold mb-1 ${
                  isDarkMode ? 'text-white' : 'text-slate-800'
                }`}>{item.value}</h3>
                <p className={`text-md ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>{item.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="w-full my-24 border-t border-emerald-300/30" />

      {/* Image Carousel Style Layout */}
      <div className="text-center mb-12">
        <h3 className={`text-4xl font-bold mb-3 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          <span className="text-emerald-900">Visual</span> Impact
        </h3>
        <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
          Real moments captured from our community-led initiatives
        </p>
      </div>

      {/* Staggered Visual Impact Images */}
<div className="relative flex flex-wrap items-center justify-center gap-6 md:gap-10 max-w-6xl mx-auto px-4">
  {imageData.map((img, index) => {
    const rotation = ['-rotate-2', 'rotate-2', '-rotate-1'][index % 3];
    const offset = ['translate-y-2', 'translate-y-6', 'translate-y-4'][index % 3];
    const z = ['z-30', 'z-20', 'z-10'][index % 3];
    
    return (
      <div
        key={index}
        className={`relative w-72 h-56 md:w-80 md:h-60 rounded-2xl overflow-hidden group shadow-xl transform hover:scale-105 transition-all duration-500 ${rotation} ${offset} ${z}`}
      >
        <img
          src={img.src}
          alt={img.alt}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <p className="text-white text-lg font-medium">{img.alt}</p>
        </div>
        {/* Soft glow on hover */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-400 opacity-0 group-hover:opacity-20 blur-xl transition duration-500" />
      </div>
    );
  })}
</div>

        <div className="text-center mt-24 relative z-10">
          <button className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-purple-600 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 hover:shadow-xl hover:scale-105">
            View All Services
            <FaArrowRight className="ml-3 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
    </section>
  );
};

export default ImpactShowcase;
