import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { resetBlockedUserFlag, checkUserStatus } from '../services/api';

const BlockedUserContext = createContext();

export const useBlockedUser = () => {
  const context = useContext(BlockedUserContext);
  if (!context) {
    throw new Error('useBlockedUser must be used within a BlockedUserProvider');
  }
  return context;
};

export const BlockedUserProvider = ({ children }) => {
  // Initialize state from localStorage to persist blocked state
  const [isBlocked, setIsBlocked] = useState(() => {
    try {
      const stored = localStorage.getItem('user_blocked_state');
      return stored ? JSON.parse(stored) : false;
    } catch (error) {
      return false;
    }
  });
  
  const [blockInfo, setBlockInfo] = useState(() => {
    try {
      const stored = localStorage.getItem('user_block_info');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      return null;
    }
  });
  
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      return null;
    }
  });
  
  const [hasShownToast, setHasShownToast] = useState(() => {
    try {
      const stored = localStorage.getItem('user_toast_shown');
      return stored ? JSON.parse(stored) : false;
    } catch (error) {
      return false;
    }
  });

  // Function to verify current blocked status with server
  // Guard to prevent overlapping server checks
  const [checkingStatus, setCheckingStatus] = useState(false);

  const verifyBlockedStatus = async () => {
    if (checkingStatus) return; // prevent overlap
    setCheckingStatus(true);
    console.log('🔍 Verifying blocked status with server...');
    try {
      const statusResult = await checkUserStatus();
      console.log('📊 Server status check result:', statusResult);

      if (!statusResult.success) {
        // Unknown error from status check; do not flip local state
        return;
      }

      if (statusResult.isBlocked === false && isBlocked) {
        console.log('🎉 User has been unblocked! Clearing local blocked state...');
        clearBlockedState();
        toast.success('Your account has been unblocked! You can now use the platform.', {
          autoClose: 5000,
          position: 'top-center'
        });
      } else if (statusResult.isBlocked === true && !isBlocked) {
        console.log('🚫 User has been blocked! Setting blocked state...');
        handleBlockedUser(statusResult);
      }
    } catch (error) {
      console.error('❌ Error verifying blocked status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  // Check blocked state on initialization and set up periodic checks
  useEffect(() => {
    console.log('🔍 BlockedUserProvider initialized with state:', { 
      isBlocked, 
      hasBlockInfo: !!blockInfo, 
      hasUser: !!user 
    });
    
    // Check if current user is admin - admins should not be processed by blocked user system
    let currentUserData = user;
    if (!currentUserData) {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          currentUserData = JSON.parse(userStr);
        }
      } catch (error) {
        console.error('❌ Error parsing user from localStorage:', error);
      }
    }
    
    // Skip blocked user processing for admin users
    if (currentUserData?.role === 'admin') {
      console.log('🔑 Admin user detected - skipping blocked user processing');
      if (isBlocked) {
        console.log('🧹 Clearing blocked state for admin user');
        clearBlockedState();
      }
      return;
    }
    
    // If user is marked as blocked but we don't have complete info, try to restore it
    if (isBlocked && (!blockInfo || !user)) {
      console.log('⚠️ Blocked user detected but missing info, attempting to restore...');
      
      try {
        const storedBlockInfo = localStorage.getItem('user_block_info');
        const storedUser = localStorage.getItem('user');
        
        if (storedBlockInfo && !blockInfo) {
          setBlockInfo(JSON.parse(storedBlockInfo));
          console.log('📋 Restored block info from localStorage');
        }
        
        if (storedUser && !user) {
          setUser(JSON.parse(storedUser));
          console.log('👤 Restored user info from localStorage');
        }
      } catch (error) {
        console.error('❌ Error restoring blocked user info:', error);
      }
    }
    
    // Verify status on initialization if user thinks they're blocked
    if (isBlocked) {
      console.log('🔄 Blocked user detected on init - verifying with server...');
      verifyBlockedStatus();
    }
    
    // Set up periodic check every 30 seconds if user is blocked
    let statusCheckInterval;
    if (isBlocked) {
      console.log('⏰ Setting up periodic status check for blocked user...');
      statusCheckInterval = setInterval(verifyBlockedStatus, 30000); // Check every 30 seconds
    }
    
    return () => {
      if (statusCheckInterval) {
        console.log('🧹 Cleaning up status check interval');
        clearInterval(statusCheckInterval);
      }
    };
  }, [isBlocked]); // Re-run when blocked status changes

  // Function to handle blocked user from API response
  const handleBlockedUser = (errorData, userInfo = null) => {
    console.log('🚫 BlockedUserContext: User blocked detected:', errorData);
    console.log('📋 Current blocked state:', { isBlocked, hasShownToast });
    
    // Set user info - either from parameter or try to get from localStorage
    let finalUser = userInfo;
    if (!finalUser) {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          finalUser = JSON.parse(userStr);
          console.log('👤 Retrieved user from localStorage:', finalUser);
        }
      } catch (error) {
        console.error('❌ Error parsing user from localStorage in context:', error);
      }
    }
    
    // Skip processing if the user is an admin
    if (finalUser?.role === 'admin') {
      console.log('🔑 Admin user detected in blocked user handler - skipping processing');
      return;
    }
    
    // Always process blocked user - don't skip if already blocked as we might need to update info
    console.log('🔄 Processing blocked user...');
    
    const blockInfoData = {
      blockReason: errorData.blockReason || 'Account has been suspended. Contact admin for clarification.',
      blockedAt: errorData.blockedAt,
      ...errorData
    };
    
    // Set all states and persist to localStorage
    setIsBlocked(true);
    localStorage.setItem('user_blocked_state', 'true');
    
    setBlockInfo(blockInfoData);
    localStorage.setItem('user_block_info', JSON.stringify(blockInfoData));
    
    if (finalUser) {
      setUser(finalUser);
      localStorage.setItem('user', JSON.stringify(finalUser));
    }
    
    console.log('✅ BlockedUserContext updated:', {
      isBlocked: true,
      blockInfo: blockInfoData,
      user: finalUser
    });
    
    // Show toast notification only once
    if (!hasShownToast) {
      setHasShownToast(true);
      localStorage.setItem('user_toast_shown', 'true');
      toast.error('Your account has been suspended. Please contact admin.', {
        autoClose: false,
        closeOnClick: false,
        draggable: false
      });
      console.log('📢 Blocked user toast notification shown');
    }
  };

  // Function to clear blocked state (for logout)
  const clearBlockedState = () => {
    console.log('🧹 Clearing blocked user state...');
    setIsBlocked(false);
    setBlockInfo(null);
    setUser(null);
    setHasShownToast(false);
    
    // Clear from localStorage
    localStorage.removeItem('user_blocked_state');
    localStorage.removeItem('user_block_info');
    localStorage.removeItem('user_toast_shown');
    // Also clear cached user info on logout or state reset
    try { localStorage.removeItem('user'); } catch (e) { /* no-op */ }
    
    // Reset API interceptor flag
    resetBlockedUserFlag();
    
    console.log('✅ Blocked user state cleared');
  };

  // Function to update user info
  const updateUser = (userInfo) => {
    setUser(userInfo);
  };

  const value = {
    isBlocked,
    blockInfo,
    user,
    handleBlockedUser,
    clearBlockedState,
    updateUser,
    verifyBlockedStatus
  };

  return (
    <BlockedUserContext.Provider value={value}>
      {children}
    </BlockedUserContext.Provider>
  );
};

export default BlockedUserContext;
