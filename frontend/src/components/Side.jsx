

import { Link, useLocation } from 'react-router-dom';
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { resetBlockedUserFlag } from '../services/api';
import {
  LayoutDashboard,
  Leaf,
  Calendar,
  MessageCircle,
  User,
  Settings,
  LogOut,
  HelpCircle
} from 'lucide-react';

const Side = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    // Reset blocked user flag to prevent flickering
    resetBlockedUserFlag();

    // Show success message
    toast.success('Logged out successfully!');

    // Redirect to login page and replace current history entry
    navigate('/login', { replace: true });
  };
  const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: 'dashboard' },
  { icon: Leaf, label: 'Eco Opportunities', path: 'eco-opportunities' },
  { icon: Calendar, label: 'Pickup Schedule', path: 'pickup-schedule' },
  { icon: MessageCircle, label: 'Messages', path: 'message' },
  { icon: User, label: 'My Profile', path: 'profile' },
  { icon: Settings, label: 'Settings', path: 'settings' },
  { icon: HelpCircle, label: 'Help & Support', path: 'help' },
  ];

  const location = useLocation();
  // Get the base path (e.g., "admin" or "volunteer") from the current URL
  const basePath = location.pathname.split('/')[1];

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-lg flex-col z-30">


      {/* Spacer for navbar */}
      <div className="h-16 bg-white dark:bg-gray-900"></div>

      {/* Navigation Menu */}
      <nav className="p-4 flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            // Construct the full path dynamically
            // Special case for My Profile: always go to /{basePath}/profile
            const fullPath = `/${basePath}/${item.path}`;

            // Check if the current URL matches the link's path.
            // Also handles the index route (e.g., /volunteer showing Dashboard as active).
            const isActive = location.pathname === fullPath ||
              (item.path === 'dashboard' && location.pathname === `/${basePath}`);

            return (
              <li key={index}>
                <Link
                  to={fullPath} // Use the dynamically created full path
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group cursor-pointer ${isActive
                      ? 'bg-green-600 dark:bg-green-700 text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-800 hover:text-green-600 dark:hover:text-green-400'
                    }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4">
        {/* <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-white bg-red-500 hover:bg-red-600 transition-all duration-200 group cursor-pointer"> */}

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-white bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 transition-all duration-200 group cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
      </div>
    </aside>
  );
};

export default Side;
