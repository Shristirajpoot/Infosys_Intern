import React from 'react';
import { LogOut, Mail, Phone, AlertTriangle, Clock, Shield } from 'lucide-react';
import { authAPI, resetBlockedUserFlag } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useBlockedUser } from '../contexts/BlockedUserContext';

const BlockedUserScreen = ({ blockInfo, user }) => {
  const navigate = useNavigate();
  const { clearBlockedState } = useBlockedUser();

  // Debug logging
  console.log('🚫 BlockedUserScreen rendered with:', { blockInfo, user });

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      // Clear any blocked state and cached user info locally
      clearBlockedState();
      resetBlockedUserFlag(); // Reset blocked user flag
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API fails
      try { clearBlockedState(); } catch { }
      resetBlockedUserFlag(); // Reset blocked user flag
      try { localStorage.clear(); } catch { }
      navigate('/auth');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-black dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-red-100 dark:border-red-900/50">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Account Suspended
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Your account has been temporarily suspended by the admin.
            </p>
          </div>

          {/* Block Information */}
          <div className="bg-red-50 dark:bg-red-900/30 rounded-2xl p-6 mb-8 border border-red-100 dark:border-red-800/50">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">
                  Suspension Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">Reason:</p>
                    <p className="text-red-700 dark:text-red-300 leading-relaxed">
                      {blockInfo?.blockReason || 'No specific reason provided. Please contact admin for more information.'}
                    </p>
                  </div>

                  {blockInfo?.blockedAt && (
                    <div className="flex items-center space-x-2 text-sm text-red-700 dark:text-red-300">
                      <Clock className="w-4 h-4" />
                      <span>Suspended on: {formatDate(blockInfo.blockedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-2xl p-6 mb-8 border border-blue-100 dark:border-blue-800/50">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4 flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Need Help? Contact Admin
            </h3>
            <div className="space-y-4">
              <p className="text-blue-800 dark:text-blue-300 leading-relaxed">
                If you believe this suspension is in error or if you'd like to appeal this decision,
                please contact our admin team:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-700 rounded-xl border border-blue-200 dark:border-blue-900">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Support</p>
                    <p className="text-blue-600 dark:text-blue-400 font-medium">admin@wastezero.com</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-700 rounded-xl border border-blue-200 dark:border-blue-900">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Support</p>
                    <p className="text-blue-600 dark:text-blue-400 font-medium">+1 (555) 123-4567</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Name:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{user.name}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Email:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{user.email}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Role:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-gray-100 capitalize">{user.role}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Account ID:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-gray-100 font-mono text-xs">{user._id || user.id}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={handleLogout}
              className="flex-1 bg-red-600 dark:bg-red-700 text-white px-6 py-3 rounded-xl hover:bg-red-700 dark:hover:bg-red-800 transition-colors flex items-center justify-center space-x-2 font-medium shadow-md hover:shadow-lg"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>

            <a
              href={`mailto:admin@wastezero.com?subject=${encodeURIComponent('Account Suspension Appeal')}&body=${encodeURIComponent(`Hello, I would like to appeal my account suspension.\n\nAccount ID: ${user?._id || user?.id || ''}\nName: ${user?.name || ''}\nEmail: ${user?.email || ''}\n\nPlease review my case.`)}`}
              className="flex-1 bg-blue-600 dark:bg-blue-700 text-white px-6 py-3 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors flex items-center justify-center space-x-2 font-medium text-center shadow-md hover:shadow-lg"
            >
              <Mail className="w-5 h-5" />
              <span>Contact Admin</span>
            </a>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This action helps maintain the safety and integrity of WasteZero. If unblocked by an admin, your access will be restored automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockedUserScreen;
