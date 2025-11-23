import React from 'react';
import { Link } from 'react-router-dom'; 
import { Shredder, Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 text-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        
        {/* Animated Icon */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-green-500/10 dark:bg-green-500/5 rounded-full blur-3xl"></div>
          <Shredder className='mx-auto h-24 w-24 text-green-600 dark:text-green-500 transform -rotate-12 animate-pulse relative z-10'/>
        </div>

        {/* 404 Text */}
        <h1 className="text-6xl sm:text-7xl font-extrabold bg-gradient-to-r from-green-600 to-green-500 dark:from-green-500 dark:to-green-400 bg-clip-text text-transparent tracking-tight">
          404
        </h1>
        
        {/* Title */}
        <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Page Not Found
        </h2>
        
        {/* Description */}
        <p className="mt-4 text-base text-gray-600 dark:text-gray-400 leading-relaxed">
          Oops! It looks like you've taken a wrong turn on the pickup route. The page you are looking for might have been recycled or doesn't exist.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-900 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Home className="w-5 h-5 mr-2" />
            Go to Homepage
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-base font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-900 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>
        </div>

        {/* Decorative Element */}
        <div className="mt-12 text-sm text-gray-500 dark:text-gray-500">
          <p>Lost? Try searching or contact support for help.</p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
