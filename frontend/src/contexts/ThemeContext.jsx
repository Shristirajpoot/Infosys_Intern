import React, { createContext, useState, useEffect, useContext } from 'react';

// 1. Create the context to hold the theme state
const ThemeContext = createContext();

// 2. Create a custom hook for easy access to the context
export const useTheme = () => useContext(ThemeContext);

// 3. Create the Provider component that will wrap your app
export const ThemeProvider = ({ children }) => {
  // State to hold the current theme (dark or light)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    // Use saved theme, or fall back to user's system preference
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Effect to apply the theme class to the root HTML element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark'); // Save preference
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light'); // Save preference
    }
  }, [isDarkMode]);

  // Function to toggle the theme
  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  // Provide the state and the toggle function to children components
  const value = {
    isDarkMode,
    toggleDarkMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
