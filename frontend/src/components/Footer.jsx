import React from 'react';
import { FaRecycle, FaLeaf, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { isDarkMode } = useTheme();

  const footerLinks = {
    company: [
      { name: 'About Us', href: '#mission' },
      { name: 'Our Services', href: '#services' },
      { name: 'How It Works', href: '#' },
      { name: 'Careers', href: '#' },
    ],
    support: [
      { name: 'Help Center', href: '#' },
      { name: 'Contact Us', href: '#contact' },
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
    ],
    connect: [
      { name: 'Schedule Pickup', href: '/pickup-schedule' },
      { name: 'Become a Volunteer', href: '#' },
      { name: 'Partner With Us', href: '#' },
      { name: 'Blog', href: '#' },
    ],
  };

  const socialLinks = [
    { icon: FaFacebookF, href: '#', label: 'Facebook' },
    { icon: FaTwitter, href: '#', label: 'Twitter' },
    { icon: FaInstagram, href: '#', label: 'Instagram' },
    { icon: FaLinkedinIn, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer id="contact" className={`text-white transition-colors duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950'
        : 'bg-gradient-to-br from-gray-900 via-emerald-900 to-purple-900'
    }`}>
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <FaRecycle className="text-4xl text-emerald-400" />
                <FaLeaf className="absolute -top-1 -right-1 text-sm text-purple-300" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">
                  Waste<span className="text-emerald-400">Zero</span> Recycling Platform
                </h3>
                <p className="text-xs text-emerald-200 tracking-widest">Sustainable Future</p>
              </div>
            </div>
            <p className="text-emerald-100/80 mb-6 leading-relaxed">
              Building a cleaner, greener tomorrow through innovative waste management solutions and community engagement.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-emerald-200/90">
                <FaEnvelope className="text-emerald-400" />
                <span className="text-sm">support@wastezero.com</span>
              </div>
              <div className="flex items-center gap-3 text-emerald-200/90">
                <FaPhone className="text-emerald-400" />
                <span className="text-sm">+1 (999) 990-0099</span>
              </div>
              <div className="flex items-center gap-3 text-emerald-200/90">
                <FaMapMarkerAlt className="text-emerald-400" />
                <span className="text-sm">210 Sunny Boulevard , NatureVille</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-emerald-200/80 hover:text-emerald-300 transition-colors duration-200 text-sm inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 h-0.5 bg-emerald-400 group-hover:w-4 transition-all duration-300"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-emerald-200/80 hover:text-emerald-300 transition-colors duration-200 text-sm inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 h-0.5 bg-emerald-400 group-hover:w-4 transition-all duration-300"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Get Involved</h4>
            <ul className="space-y-3 mb-6">
              {footerLinks.connect.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-emerald-200/80 hover:text-emerald-300 transition-colors duration-200 text-sm inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 h-0.5 bg-emerald-400 group-hover:w-4 transition-all duration-300"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>

            {/* Social Links */}
            <div>
              <h5 className="text-sm font-semibold mb-4 text-emerald-200">Follow Us</h5>
              <div className="flex gap-3">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      aria-label={social.label}
                      className="w-10 h-10 bg-white/10 hover:bg-gradient-to-br hover:from-emerald-500 hover:to-purple-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                    >
                      <Icon className="text-sm" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-white/10 pt-10 pb-8">
          <div className="max-w-2xl mx-auto text-center">
            <h4 className="text-2xl font-bold mb-3">Stay Updated</h4>
            <p className="text-emerald-200/80 mb-6">
              Subscribe to our newsletter for updates, and exclusive offers
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder:text-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold py-3 px-8 rounded-full hover:from-emerald-600 hover:to-green-700 transition-all duration-300 hover:shadow-lg"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 bg-black/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-emerald-200/70 text-sm">
              &copy; {currentYear} <span className="font-semibold text-white">WasteZero</span>. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-emerald-200/70">
              <a href="#" className="hover:text-emerald-300 transition-colors duration-200">
                Privacy
              </a>
              <span>•</span>
              <a href="#" className="hover:text-emerald-300 transition-colors duration-200">
                Terms
              </a>
              <span>•</span>
              <a href="#" className="hover:text-emerald-300 transition-colors duration-200">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
