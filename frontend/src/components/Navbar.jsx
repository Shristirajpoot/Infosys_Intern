

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { resetBlockedUserFlag } from '../services/api';
import { SearchIcon, Bell, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { useUser } from '../contexts/UserContext';
import { volunteerAPI } from '../services/api';


const Navbar = () => {
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const { unreadCount } = useNotifications();
  const { user, clearUser, loading, fetchUserProfile } = useUser();
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Fallback user info from localStorage if context is loading
  const fallbackUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Use actual user data from UserContext, fallback to localStorage, or show default
  const displayUser = user || fallbackUser || {
    name: 'User',
    email: 'user@example.com',
    role: 'user'
  };

  // Fetch user profile if not already loaded and user has token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user && !loading) {
      fetchUserProfile();
    }
  }, [user, loading, fetchUserProfile]);



  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // --- Search state and behavior ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchDebounceRef = useRef(null);
  const abortRef = useRef(null);
  const prevResultIdsRef = useRef('');

  // Close search results on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (!searchRef.current) return;
      if (!searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const runSearch = async (q) => {
    const term = q.trim();
    if (term.length === 0) { setSearchResults([]); setSearchOpen(false); prevResultIdsRef.current=''; return; }
    if (term.length < 2) { return; }
    try {
      setSearchLoading(true);
      // Cancel any in-flight request
      if (abortRef.current) {
        abortRef.current.abort();
      }
      abortRef.current = new AbortController();
      // use volunteer endpoint for opportunities listing; server does not restrict by role
      const resp = await volunteerAPI.getAllOpportunities({ q: term, limit: 8, includeMatched: 'false' }, { signal: abortRef.current.signal });
      const data = resp?.data || resp; // support both shapes
      const arr = Array.isArray(data) ? data : [];
      const ids = arr.map(x => x._id).join(',');
      if (ids !== prevResultIdsRef.current) {
        prevResultIdsRef.current = ids;
        setSearchResults(arr);
      }
      // keep dropdown open while searching/typing as long as there's a query
      if (term.length > 0) setSearchOpen(true);
    } catch (err) {
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') {
        // ignore; another search is in-flight
      } else {
        console.error('Search failed', err);
        // keep previous results to avoid flicker
      }
    } finally {
      setSearchLoading(false);
    }
  };

  const onSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    const term = val.trim();
    if (term.length > 0 && term.length >= 2) {
      if (!searchOpen) setSearchOpen(true);
    } else if (term.length === 0) {
      // small delay to avoid flicker when quickly deleting
      setTimeout(() => { setSearchOpen(false); setSearchResults([]); }, 60);
    }
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => runSearch(val), 300);
  };

  const openFullSearch = (term, id) => {
    setSearchOpen(false);
    // Navigate to opportunities tab and optionally highlight a specific card.
    // Do NOT pass the query; keep page search independent from navbar search.
    const idPart = id ? `&id=${encodeURIComponent(id)}` : '';
    navigate(`/volunteer?tab=opportunities${idPart}`);
  };

  const onSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      setSearchOpen(false);
    } else if (e.key === 'Enter') {
      openFullSearch(searchQuery);
    }
  };

  const goToOpportunity = (op) => {
    // Navigate to the opportunities list, pre-filled and target the selected card
    openFullSearch(op?.title || searchQuery, op?._id);
  };

  const handleLogout = () => {
    // Clear user data from context and localStorage
    clearUser();

    // Reset blocked user flag to prevent flickering
    resetBlockedUserFlag();

    // Show success message
    toast.success('Logged out successfully!');

    // Redirect to login page and replace current history entry
    navigate('/login', { replace: true });

    // Close dropdown
    setShowProfileDropdown(false);
  };

  const handleProfileClick = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleNotificationClick = () => {
    // Navigate to notifications page based on user role
    const userRole = displayUser.role || 'volunteer'; // Default to volunteer if no role
    if (userRole === 'admin') {
      navigate('/admin/notifications');
    } else if (userRole === 'ngo') {
      navigate('/ngo/notifications');
    } else {
      navigate('/volunteer/notifications');
    }
  };
  
  return (
    <>
      <nav className='fixed top-0 left-0 right-0 h-16 z-[100] bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm w-full'>
        <div className='flex justify-between items-center h-full px-6'>
          {/* left panel - logo */}
          <div className='flex items-center'>
            <img src="/logo.webp" alt="WasteZero Logo" className="size-11 rounded-full" />
            <span className="ml-2 text-xl hidden md:block font-semibold text-gray-900 dark:text-white">WasteZero</span>
          </div>

          {/* center - navigation items */}
          {/* <div className='flex space-x-6'>
            {["Dashboard", "Opportunities", "Schedule Pickup", "Message", "My Profile"].map((key, index) => {
              return (
                <p key={index} className='p-2 text-[#dad7cd] hover:text-white cursor-pointer transition-colors duration-200 hidden lg:flex'>{key}</p>
              )
            })}
          </div> */}

          {/* right panel - search and avatar */}
          <div className='flex items-center gap-5'>
            <div ref={searchRef} className='relative w-64 sm:w-80'>
              <div className='flex items-center border border-gray-300 dark:border-gray-600 rounded-full px-3 py-1 bg-gray-50 dark:bg-gray-800 focus-within:ring-2 focus-within:ring-green-500 dark:focus-within:ring-green-600 transition-all duration-200'>
                <SearchIcon className='text-gray-400 dark:text-gray-500 size-5 mr-2 flex-shrink-0' />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={onSearchChange}
                  onFocus={() => { if (searchResults.length) setSearchOpen(true); }}
                  onKeyDown={onSearchKeyDown}
                  placeholder="Search opportunities..."
                  className="outline-none bg-transparent flex-1 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                />
                {searchLoading && (
                  <span className="ml-2 inline-block w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-green-500 rounded-full animate-spin" />
                )}
              </div>
              {searchOpen && (
                <div className='absolute mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-auto'>
                  {searchLoading ? (
                    <div className='p-3 text-sm text-gray-500 dark:text-gray-400'>Searching…</div>
                  ) : searchResults.length === 0 ? (
                    <div className='p-3 text-sm text-gray-500 dark:text-gray-400'>No results</div>
                  ) : (
                    <ul className='py-1'>
                      {searchResults.map((op) => (
                        <li key={op._id}>
                          <button
                            className='w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
                            onClick={() => goToOpportunity(op)}
                          >
                            <div className='text-sm font-medium text-gray-900 dark:text-gray-100 truncate'>{op.title}</div>
                            <div className='text-xs text-gray-500 dark:text-gray-400 truncate'>{op.location} • {op.category}</div>
                          </button>
                        </li>
                      ))}
                      <li>
                        <button
                          className='w-full text-left px-3 py-2 text-sm text-green-700 dark:text-green-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
                          onClick={() => openFullSearch(searchQuery)}
                        >
                          See all results for "{searchQuery}"
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              )}
            </div>
            <div className="relative">
              <button 
                onClick={handleNotificationClick}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 relative"
              >
                <Bell className='text-gray-700 dark:text-gray-300 size-5' />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Profile Dropdown */}
            <div className='relative z-50' ref={dropdownRef}>
              <div
                className='flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-2 transition-colors duration-200'
                onClick={handleProfileClick}
              >
                <div className='size-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center'>
                  <User className='w-4 h-4 text-green-700 dark:text-green-300' />
                </div>
                <span className='text-gray-900 dark:text-gray-100 text-sm font-medium hidden md:block'>
                  {displayUser.name || 'User'}
                </span>
                <ChevronDown className='w-4 h-4 text-gray-700 dark:text-gray-300 hidden md:block' />
              </div>

              {/* Dropdown Menu */}
              {showProfileDropdown && (
                <div className='absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50'>
                  <div className='px-4 py-2 border-b border-gray-100 dark:border-gray-700'>
                    <p className='text-sm font-medium text-gray-900 dark:text-gray-100'>{displayUser.name || 'User'}</p>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>{displayUser.email || 'user@example.com'}</p>
                    <div className='flex items-center justify-between mt-1'>
                      <span className='inline-block px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-full'>
                        {displayUser.role ? displayUser.role.toUpperCase() : 'USER'}
                      </span>
                      {displayUser.location && (
                        <span className='text-xs text-gray-400 dark:text-gray-500'>
                        {displayUser.location}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    className='w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200'
                    onClick={() => {
                      const userRole = displayUser.role || 'volunteer';
                      if (userRole === 'admin') {
                        navigate('/admin/profile');
                      } else if (userRole === 'ngo') {
                        navigate('/ngo/profile');
                      } else {
                        navigate('/volunteer/profile');
                      }
                      setShowProfileDropdown(false);
                    }}
                  >
                    <User className='w-4 h-4' />
                    My Profile
                  </button>

                  <button
                    className='w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200'
                    onClick={() => setShowProfileDropdown(false)}
                  >
                    <Settings className='w-4 h-4' />
                    Settings
                  </button>

                  <hr className='my-1' />

                  <button
                    className='w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200'
                    onClick={handleLogout}
                  >
                    <LogOut className='w-4 h-4' />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar;
