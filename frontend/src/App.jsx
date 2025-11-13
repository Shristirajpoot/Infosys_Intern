import React, { useEffect,useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css'
import AuthPage from './pages/AuthPage'
import AdminDashboard from './pages/AdminDashboard'
import UsersPage from "./pages/UsersPage";
import WasteZeroAnalytics from './pages/AnalyticDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard'
import NGODashboard from './pages/NGODashboard'
import NotificationsPage from './pages/NotificationsPage'
import AppFooter from './components/AppFooter';
import Navbar from './components/Navbar';
import Sidebar from './components/Side';
import Forgot_Password from './pages/Forgot_Password';
import Homepage from './pages/Homepage';
import MessagePage from './pages/MessagePage';
import MyProfile from './pages/MyProfile';
import { NotificationProvider } from './contexts/NotificationContext';
import { BlockedUserProvider, useBlockedUser } from './contexts/BlockedUserContext';
import { UserProvider, useUser } from './contexts/UserContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { setGlobalBlockedUserHandler } from './services/api';
import BlockedUserScreen from './components/BlockedUserScreen';
import AttendanceManager from './pages/AttendanceManager';
import NotFoundPage from './pages/NotFoundPage';
import SettingsPage from './pages/SettingsPage';
import EcoOpportunities from './pages/EcoOpportunities';
import PickupSchedule from './pages/PickupSchedule';
import HelpSupport from './pages/HelpSupport';

// Inner App component that uses BlockedUserContext
const AppContent = () => {
  const { isBlocked, blockInfo, user, handleBlockedUser, clearBlockedState } = useBlockedUser();

  useEffect(() => {
    // Set the global blocked user handler for API interceptor
    setGlobalBlockedUserHandler(handleBlockedUser);
    console.log('🔗 Global blocked user handler set');
    
    // Only clear blocked state on initial mount, not on unmount
    // This prevents clearing when user navigates between routes
  }, [handleBlockedUser]); // Removed clearBlockedState from dependencies

  // Debug the blocked user state
  console.log('🔍 App state check:', { isBlocked, blockInfo, user });

  // If user is blocked, show blocked screen (with fallback check)
  const shouldShowBlockedScreen = isBlocked || localStorage.getItem('user_blocked_state') === 'true';
  
  if (shouldShowBlockedScreen) {
    console.log('🚫 RENDERING BlockedUserScreen:', { 
      isBlocked, 
      blockInfo, 
      user, 
      fallbackTriggered: !isBlocked 
    });
    return <BlockedUserScreen blockInfo={blockInfo} user={user} />;
  }

  // Normal app content
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Homepage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/forgot-password" element={<Forgot_Password />} />
        <Route path="/otp" element={<Forgot_Password />} />
        <Route path="/not-found" element={<NotFoundPage/>} />

        {/* Protected Routes */}
        <Route element={<RequireAuth />}>
          {/* Admin Routes (admin only) */}
          <Route element={<RequireRole role="admin" />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="analytics" element={<WasteZeroAnalytics />} />
              <Route path="eco-opportunities" element={<EcoOpportunities />} />
              <Route path="pickup-schedule" element={<PickupSchedule />} />
              <Route path="message" element={<MessagePage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<MyProfile />} />
              <Route path="attendance" element={<AttendanceManager />} /> 
              <Route path="settings" element={<SettingsPage/>} />
              <Route path="help" element={<HelpSupport />} />
            </Route>
          </Route>

          {/* Volunteer Routes (volunteer only) */}
          <Route element={<RequireRole role="volunteer" />}>
            <Route path="/volunteer" element={<VolunteerLayout />}>
              <Route index element={<VolunteerDashboard />} />
              <Route path="dashboard" element={<VolunteerDashboard />} />
              <Route path="eco-opportunities" element={<EcoOpportunities />} />
              <Route path="pickup-schedule" element={<PickupSchedule />} />
              <Route path="message" element={<MessagePage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<MyProfile />} />
              <Route path="settings" element={<SettingsPage/>} />
              <Route path="help" element={<HelpSupport />} />
            </Route>
          </Route>

          {/* NGO Routes (ngo only) */}
          <Route element={<RequireRole role="ngo" />}>
            <Route path="/ngo" element={<NGOLayout />}>
              <Route index element={<NGODashboard />} />
              <Route path="dashboard" element={<NGODashboard />} />
              
              <Route path="eco-opportunities" element={<EcoOpportunities />} />
              <Route path="pickup-schedule" element={<PickupSchedule />} />
              <Route path="message" element={<MessagePage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<MyProfile />} />
              <Route path="settings" element={<SettingsPage/>} />
              <Route path="help" element={<HelpSupport />} />
            </Route>
          </Route>
        </Route>

        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

// Route guard: redirects unauthenticated users to /login
const RequireAuth = () => {
  const { loading } = useUser();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-gray-400 rounded-full" role="status" aria-label="loading" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

// Role guard: ensures route access only for the specified role
const RequireRole = ({ role }) => {
  const { user, loading } = useUser();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-gray-400 rounded-full" role="status" aria-label="loading" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Determine current role (prefer context; fallback to localStorage)
  const currentRole = user?.role || (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}')?.role; } catch { return undefined; }
  })();

  if (!currentRole) {
    return <Navigate to="/login" replace />;
  }

  if (currentRole !== role) {
    // Redirect to the correct home for the logged-in user's role
    const home = currentRole === 'admin' ? '/admin' : currentRole === 'volunteer' ? '/volunteer' : currentRole === 'ngo' ? '/ngo' : '/';
    return <Navigate to={home} replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <ThemeProvider>
    <UserProvider>
      <NotificationProvider>
        <BlockedUserProvider>
          <Router>
            <AppContent />
          </Router>
        </BlockedUserProvider>
      </NotificationProvider>
    </UserProvider>
    </ThemeProvider>
  )
}

// Admin Layout Component with Navbar and Sidebar
const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
      <Navbar />
      <Sidebar />
      {/* Main content area with left margin to account for sidebar on desktop only */}
      <div className="lg:ml-64">
        <Outlet />
        <AppFooter />
      </div>
    </div>
  )
}

const VolunteerLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
      <Navbar />
      <Sidebar />
      {/* Main content area with left margin to account for sidebar on desktop only */}
      <div className="lg:ml-64">
        <Outlet />
        <AppFooter />
      </div>
    </div>
  )
}

const NGOLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
      <Navbar />
      <Sidebar />
      {/* Main content area with left margin to account for sidebar on desktop only */}
      <div className="lg:ml-64">
        <Outlet />
        <AppFooter />
      </div>
    </div>
  )
}

export default App

App.jsx
