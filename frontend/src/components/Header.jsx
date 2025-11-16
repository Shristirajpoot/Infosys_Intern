import React, { useState, useEffect } from 'react';
import { FaRecycle, FaLeaf } from 'react-icons/fa';
import { FiMenu, FiX } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#services', text: 'Services' },
    { href: '#mission', text: 'Our Mission' },
    { href: '#about', text: 'About' },
    { href: '#contact', text: 'Contact' },
  ];

  // We always show Sign in on the public header CTA to direct users to login

  return (
    <header 
  className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
    isDarkMode
      ? 'bg-gradient-to-r from-emerald-950 via-purple-900 to-teal-900 py-4 shadow-md'
      : 'bg-gradient-to-r from-emerald-900 via-purple-800 to-teal-900 py-4 shadow-md'
  }`}
>
      <div className="container mx-auto flex items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 relative">
  <img
    src="/logo.webp"
    alt="WasteZero Logo"
    className="w-full h-full object-contain"
  />
</div>
          <div>
            <h1 className={`text-2xl lg:text-3xl font-bold tracking-tight transition-colors duration-300 ${
              scrolled ? (isDarkMode ? 'text-white' : 'text-gray-900') : 'text-white'
            }`}>
              Waste<span className={scrolled ? 'text-emerald-600' : 'text-emerald-400'}>Zero</span> Recycling Platform
            </h1>
            <p className={`text-xs tracking-widest transition-colors duration-300 ${
              scrolled ? (isDarkMode ? 'text-gray-400' : 'text-gray-600') : 'text-emerald-200'
            }`}>
              Sustainable Future
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <ul className="flex items-center gap-8 list-none">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={`font-medium text-base relative group transition-colors duration-300 ${
                    scrolled 
                      ? (isDarkMode ? 'text-gray-300 hover:text-emerald-400' : 'text-gray-700 hover:text-emerald-600')
                      : 'text-white hover:text-emerald-300'
                  }`}
                >
                  {link.text}
                  <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                    scrolled ? 'bg-emerald-600' : 'bg-emerald-400'
                  }`}></span>
                </a>
              </li>
            ))}
          </ul>
          <a
            href="/login"
            className={`font-semibold py-3 px-6 rounded-full text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
              scrolled
                ? 'bg-gradient-to-r from-emerald-600 to-purple-600 text-white hover:from-emerald-700 hover:to-green-700'
                : 'bg-white text-emerald-900 hover:bg-emerald-50'
            }`}
          >
            Sign in
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`focus:outline-none transition-colors duration-300 ${
              scrolled ? (isDarkMode ? 'text-white' : 'text-gray-900') : 'text-white'
            }`}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <nav className={`md:hidden mt-4 shadow-2xl rounded-b-2xl ${
          isDarkMode ? 'bg-gray-900' : 'bg-white'
        }`}>
          <ul className="flex flex-col items-center gap-1 list-none py-4">
            {navLinks.map((link) => (
              <li key={link.href} className="w-full">
                <a
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block font-medium text-base py-3 px-6 transition-colors duration-200 ${
                    isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-800 hover:text-emerald-400' 
                      : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                  }`}
                >
                  {link.text}
                </a>
              </li>
            ))}
            <li className="w-full px-6 mt-2">
              <a
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="block bg-gradient-to-r from-emerald-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-full text-center hover:from-emerald-700 hover:to-purple-700 transition-all duration-300"
              >
                Sign in
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Header;
