import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
// --- Helper Icons ---
// Using helper components for icons keeps the main component cleaner.
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);
// --- End Helper Icons ---


/**
 * A settings page for WasteZero where users can manage their preferences,
 * such as theme (dark/light mode) and account security (changing password).
 */
const SettingsPage = () => {
  // --- Dark Mode State and Logic ---
  const { isDarkMode, toggleDarkMode } = useTheme();

  // This effect runs whenever `isDarkMode` changes.
  // It adds/removes the 'dark' class from the <html> element and saves the preference.
  // --- End Dark Mode Logic ---

  // State for the password form fields
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // State for form feedback messages
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    // Basic Validation
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      setMessage('All password fields are required.');
      setIsError(true);
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage('New passwords do not match.');
      setIsError(true);
      return;
    }
    
    if (passwords.newPassword.length < 8) {
      setMessage('New password must be at least 8 characters long.');
      setIsError(true);
      return;
    }
    
    // --- API Call Simulation ---
    // In a real app, you would make an API call here to update the password.
    console.log('Submitting password update for user...');
    
    // Simulate a successful API response after 1 second
    setTimeout(() => {
        setMessage('Password updated successfully!');
        setIsError(false);
        // Clear the form fields after successful submission
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }, 1000);
    // --- End Simulation ---
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Settings</h1>

        {/* --- Appearance Settings Card --- */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Appearance</h2>
          <div className="flex items-center justify-between">
            <span className="text-md">Dark Mode</span>
            <button
              onClick={toggleDarkMode}
              className={`relative inline-flex items-center h-8 w-14 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 ${
                isDarkMode ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span className="sr-only">Toggle Dark Mode</span>
              {/* This is the container for the icons */}
              <div className="absolute inset-0 flex items-center justify-between px-2">
                <SunIcon />
                <MoonIcon />
              </div>
              {/* This is the moving circle */}
              <span className={`inline-block w-6 h-6 transform bg-white rounded-full transition-transform duration-300 ${
                  isDarkMode ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* --- Security Settings Card --- */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Change Password</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="currentPassword">Current Password</label>
              <input type="password" id="currentPassword" name="currentPassword" value={passwords.currentPassword} onChange={handlePasswordChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="newPassword">New Password</label>
              <input type="password" id="newPassword" name="newPassword" value={passwords.newPassword} onChange={handlePasswordChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="confirmPassword">Confirm New Password</label>
              <input type="password" id="confirmPassword" name="confirmPassword" value={passwords.confirmPassword} onChange={handlePasswordChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200" required />
            </div>
            {message && (
              <p className={`text-sm font-medium text-center py-2 rounded-md ${isError ? 'text-red-700 bg-red-100 dark:bg-red-900/50 dark:text-red-300' : 'text-green-700 bg-green-100 dark:bg-green-900/50 dark:text-green-300'}`}>{message}</p>
            )}
            <div className="flex justify-end pt-2">
              <button type="submit" className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 transition-colors">
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
