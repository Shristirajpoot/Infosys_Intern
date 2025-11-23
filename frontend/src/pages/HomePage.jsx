import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Stats from '../components/Stats';
import Services from '../components/Services';
import Mission from '../components/Mission';
import Footer from '../components/Footer';
import { useUser } from '../contexts/UserContext';

const HomePage = () => {
  const { isDarkMode } = useTheme();
  
  const { user } = useUser();

  return (
    <div className={`homepage min-h-screen transition-colors duration-500 ${
      isDarkMode ? 'bg-gray-950' : 'bg-white'
    }`}>
      <Header />
      <Hero />
      <Stats />
      <Services />
      <Mission />

      {/* Replace pickup scheduling section on homepage with Sign-in CTA when user is not authenticated */}
      <section className="py-20">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-4xl font-extrabold mb-4 text-gray-900 dark:text-white">Ready to schedule a pickup?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">Sign in to request a pickup, track requests, and connect with local NGOs.</p>
          <a
            href="/login"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-lg py-4 px-8 rounded-full transition-all duration-300 hover:from-emerald-600 hover:to-green-700 hover:shadow-2xl"
          >
            Sign in to Schedule Pickup
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
