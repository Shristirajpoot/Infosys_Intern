import React, { useState } from 'react';
import { FaPlus, FaMinus, FaCheckCircle, FaBullseye, FaHandsHelping } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';

// Using inline SVG for icons to remove external dependencies
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const MinusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

// Updated accordion data
const accordionData = [
  {
    id: 'programs',
    title: 'Our Programs',
    icon: FaBullseye,
    content: 'We run various community programs focused on education, waste reduction, and sustainable living practices to empower individuals to make a difference. Our initiatives include school workshops, corporate training, and community-wide awareness campaigns.',
  },
  {
    id: 'services',
    title: 'Our Services',
    icon: FaHandsHelping,
    content: 'We offer a wide range of sustainable waste management services to keep your community green and clean, including residential and commercial solutions. From regular pickups to special recycling events, we make sustainability accessible to everyone.',
  },
  {
    id: 'impact',
    title: 'Our Impact',
    icon: FaCheckCircle,
    content: 'Through partnerships with local organizations and dedicated volunteers, we\'ve diverted thousands of pounds of waste from landfills and educated countless community members about sustainable practices. Together, we\'re building a greener tomorrow.',
  },
];

const Mission = () => {
  const [openSection, setOpenSection] = useState(null);
  const { isDarkMode } = useTheme();

  // Toggles the accordion sections
  const toggleSection = (sectionId) => {
    setOpenSection(openSection === sectionId ? null : sectionId);
  };

  return (
    <section id="mission" className="relative transition-colors duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left Side: Image */}
        <div className="h-[500px] lg:h-screen lg:max-h-[800px] lg:sticky lg:top-0 relative overflow-hidden">
          <img
            src="/mission.jpg"
            alt="Community members collaborating on a recycling project"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/40 to-transparent opacity-60"></div>
          
          {/* Floating Stats Badge */}
          <div className="absolute bottom-8 left-8 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl max-w-xs">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FaCheckCircle className="text-white text-2xl" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">5000+</p>
                <p className="text-sm text-gray-600 font-medium">Lives Impacted</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Content and Accordion */}
        <div className={`p-8 sm:p-12 lg:p-16 flex flex-col justify-center transition-colors duration-500 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
            : 'bg-gradient-to-br from-emerald-50 via-purple-50 to-teal-50'
        }`}>
        {/* Header */}
        <div className="mb-8">
          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 mb-4 ${
            isDarkMode 
              ? 'bg-emerald-900/50 border border-emerald-700'
              : 'bg-emerald-100'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              isDarkMode ? 'bg-emerald-400' : 'bg-emerald-600'
            }`}></span>
            <span className={`text-sm font-semibold tracking-wide uppercase ${
              isDarkMode ? 'text-emerald-300' : 'text-emerald-800'
            }`}>Who We Are</span>
          </div>
          <h2 className={`text-4xl md:text-5xl font-extrabold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Our <span className="bg-gradient-to-r from-emerald-600 to-purple-600 bg-clip-text text-transparent">Mission</span>
          </h2>
          <p className={`text-lg leading-relaxed mb-8 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            To Empower every community to be a catalyst for change. By making recycling accessible, engaging, and rewarding, we’re shaping a future where environmental responsibility becomes a shared habit, not a challenge.
          </p>
        </div>

        {/* Accordion Section */}
        <div className="space-y-4">
          {accordionData.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.id} 
                className={`rounded-2xl overflow-hidden shadow-md border-2 transition-all duration-500 ${
                  isDarkMode
                    ? openSection === item.id
                      ? 'bg-gray-800 border-purple-500 shadow-lg'
                      : 'bg-gray-800 border-gray-700 hover:border-purple-700'
                    : openSection === item.id
                      ? 'bg-white border-purple-500 shadow-lg'
                      : 'bg-white border-gray-100 hover:border-purple-200'
                }`}
              >
                {/* Accordion Header */}
                <div
                  className={`p-5 cursor-pointer flex justify-between items-center font-semibold transition-colors duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-800 hover:bg-gray-750'
                      : 'bg-white hover:bg-purple-50/50'
                  }`}
                  onClick={() => toggleSection(item.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                      openSection === item.id 
                        ? 'bg-gradient-to-br from-emerald-500 to-green-600' 
                        : isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <Icon className={`text-lg ${
                        openSection === item.id 
                          ? 'text-white' 
                          : isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`} />
                    </div>
                    <span className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.title}</span>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    openSection === item.id 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {openSection === item.id ? <FaMinus size={14} /> : <FaPlus size={14} />}
                  </div>
                </div>

                {/* Accordion Content */}
                <div 
                  className={`overflow-hidden transition-all duration-300 ${
                    openSection === item.id ? 'max-h-48' : 'max-h-0'
                  }`}
                >
                  <div className={`p-5 pt-0 leading-relaxed ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {item.content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="mt-10">
          <button className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-purple-600 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 hover:shadow-xl hover:scale-105">
            Learn More About Us
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
      </div>
    </section>
  );
};

export default Mission;
