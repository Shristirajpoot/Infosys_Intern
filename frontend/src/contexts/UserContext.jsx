import React, { createContext, useContext, useState, useEffect } from 'react';
import { volunteerAPI, ngoAPI, adminAPI } from '../services/api';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const localUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!localUser._id && !localUser.id) {
        setUser(null);
        setLoading(false);
        return;
      }

      let response;
      const userRole = localUser.role || 'volunteer';

      // Make actual API calls to fetch user data from backend
      try {
        if (userRole === 'volunteer') {
          response = await volunteerAPI.getProfile();
        } else if (userRole === 'ngo') {
          response = await ngoAPI.getProfile();
        } else if (userRole === 'admin') {
          response = await adminAPI.getProfile();
        } else {
          // Fallback to volunteer API
          response = await volunteerAPI.getProfile();
        }
      } catch (apiError) {
        console.error('Error fetching user profile from API:', apiError);
        // Use localStorage data as fallback
        if (localUser._id || localUser.id) {
          setUser(localUser);
        } else {
          setUser(null);
        }
        setLoading(false);
        return;
      }

      if (response && response.success && response.data) {
        setUser(response.data);
        // Update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify(response.data));
      } else {
        // Use localStorage data as fallback
        if (localUser._id || localUser.id) {
          setUser(localUser);
        } else {
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // Fallback to localStorage data
      const localUser = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(localUser._id || localUser.id ? localUser : null);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const clearUser = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  useEffect(() => {
    // Only fetch if we have a token
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile();
    } else {
      setUser(null);
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    loading,
    fetchUserProfile,
    updateUser,
    clearUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
