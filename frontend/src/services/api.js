import axios from 'axios';

const baseURL = import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL, // configurable via VITE_API_BASE_URL
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// A bare axios instance without our interceptors, used for health/status checks
const bareApi = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    try {
      const user = response.data?.user;
      if (user?._id || user?.id) {
        localStorage.setItem('authUserId', user._id || user.id);
      }
    } catch {}
    return response.data;
  },

  logout: async () => {
  const response = await api.post('/auth/logout');
  try { localStorage.removeItem('authUserId'); } catch {}
    return response.data;
  },

  verifyUser: async (data) => {
    const response = await api.post('/auth/verify-user', data);
    return response.data;
  },  

  // 🔹 Forgot Password Flow
  sendOtp: async (email) => {
    const response = await api.post('/auth/send-otp', { email });
    return response.data;
  },

  verifyOtp: async (email, otp) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data;
  },

  resetPassword: async (email, password) => {
    const response = await api.post('/auth/reset-password', { email, password });
    return response.data;
  },
};

// Additional Admin API endpoints for legacy support
export const legacyAdminAPI = {
  // Dashboard data
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  getRecentActivities: async () => {
    const response = await api.get('/admin/dashboard/activities');
    return response.data;
  },

  // User management
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Pickup management
  getAllPickups: async () => {
    const response = await api.get('/admin/pickups');
    return response.data;
  },

  createPickup: async (pickupData) => {
    const response = await api.post('/admin/pickups', pickupData);
    return response.data;
  },

  updatePickup: async (pickupId, pickupData) => {
    const response = await api.put(`/admin/pickups/${pickupId}`, pickupData);
    return response.data;
  },

  // Opportunity management
  getAllOpportunities: async () => {
    const response = await api.get('/admin/opportunities');
    return response.data;
  },

  createOpportunity: async (opportunityData) => {
    const response = await api.post('/admin/opportunities', opportunityData);
    return response.data;
  },

  updateOpportunity: async (opportunityId, opportunityData) => {
    const response = await api.put(`/admin/opportunities/${opportunityId}`, opportunityData);
    return response.data;
  },

  deleteOpportunity: async (opportunityId) => {
    const response = await api.delete(`/admin/opportunities/${opportunityId}`);
    return response.data;
  },

  getOpportunityRegistrations: async (opportunityId) => {
    const response = await api.get(`/admin/opportunities/${opportunityId}/registrations`);
    return response.data;
  },

  // Reports and analytics
  getWasteCollectionReport: async (period = 'month') => {
    const response = await api.get(`/admin/reports/waste-collection?period=${period}`);
    return response.data;
  },

  getUserGrowthReport: async (period = 'month') => {
    const response = await api.get(`/admin/reports/user-growth?period=${period}`);
    return response.data;
  },

  exportReport: async (reportType, format = 'pdf') => {
    const response = await api.get(`/admin/reports/export?type=${reportType}&format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

// Message API endpoints
export const messageAPI = {
  fetchAllUsers: async () => {
    const response = await api.get('/users'); 
    return response.data;
  },

  fetchMessages: async (otherUserId) => {
    const response = await api.get(`/messages/${otherUserId}`);
    return response.data;
  },

  postMessage: async (receiverId, message) => {
    const response = await api.post(`/messages/send/${receiverId}`, { message });
    return response.data;
  },
};

// NGO API endpoints
export const ngoAPI = {
  // Profile management
  getProfile: async () => {
    const response = await api.get('/ngo/profile');
    return response.data;
  },
  updateProfile: async (profileData) => {
    const response = await api.put('/ngo/profile', profileData);
    return response.data;
  },

  // Dashboard data
  getDashboardStats: async () => {
    const response = await api.get('/ngo/dashboard/stats');
    return response.data;
  },

  getRecentActivities: async () => {
    const response = await api.get('/ngo/dashboard/activities');
    return response.data;
  },

  // Event management (NGO can only manage their own events)
  getMyEvents: async () => {
    const response = await api.get('/ngo/events');
    return response.data;
  },

  createEvent: async (eventData) => {
    const response = await api.post('/ngo/events', eventData);
    return response.data;
  },

  updateEvent: async (eventId, eventData) => {
    const response = await api.put(`/ngo/events/${eventId}`, eventData);
    return response.data;
  },

  deleteEvent: async (eventId) => {
    const response = await api.delete(`/ngo/events/${eventId}`);
    return response.data;
  },

  getEventRegistrations: async (eventId) => {
    const response = await api.get(`/ngo/events/${eventId}/registrations`);
    return response.data;
  },

  // Review applications
  reviewApplication: async (eventId, registrationId, reviewData) => {
    const response = await api.post(`/ngo/events/${eventId}/registrations/${registrationId}/review`, reviewData);
    return response.data;
  },

  // Volunteer management (volunteers registered for NGO events)
  getMyVolunteers: async () => {
    const response = await api.get('/ngo/volunteers');
    return response.data;
  },

  getVolunteerDetails: async (volunteerId) => {
    const response = await api.get(`/ngo/volunteers/${volunteerId}`);
    return response.data;
  },

  // Communication
  sendMessageToVolunteer: async (volunteerId, message) => {
    const response = await api.post(`/ngo/volunteers/${volunteerId}/message`, { message });
    return response.data;
  },

  // Reports (limited scope)
  getEventReport: async (eventId) => {
    const response = await api.get(`/ngo/reports/event/${eventId}`);
    return response.data;
  },

  getVolunteerReport: async (period = 'month') => {
    const response = await api.get(`/ngo/reports/volunteers?period=${period}`);
    return response.data;
  },

  // Attendance management
  getEventAttendance: async (eventId) => {
    const response = await api.get(`/ngo/events/${eventId}/attendance`);
    return response.data;
  },

  markAttendance: async (eventId, volunteerId, attendanceData) => {
    const response = await api.post(`/ngo/events/${eventId}/attendance/${volunteerId}`, attendanceData);
    return response.data;
  },

  markAllPresent: async (eventId, notes = '') => {
    const response = await api.post(`/ngo/events/${eventId}/attendance/mark-all-present`, { notes });
    return response.data;
  },

  exportAttendanceReport: async (eventId) => {
    const response = await api.get(`/ngo/events/${eventId}/attendance/export`, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `attendance_report_${eventId}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true, message: 'Report downloaded successfully' };
  },

  // Analytics
  getAnalytics: async (timeRange = 'month') => {
    const response = await api.get(`/ngo/analytics?timeRange=${timeRange}`);
    return response.data;
  },

  getVolunteerAnalytics: async (volunteerId) => {
    const response = await api.get(`/ngo/analytics/volunteer/${volunteerId}`);
    return response.data;
  },

  // Matching functionality
  getMatchingVolunteers: async (opportunityId, limit = 20) => {
    const response = await api.get(`/matching/volunteers/${opportunityId}?limit=${limit}`);
    return response.data;
  },

  inviteVolunteer: async (opportunityId, volunteerId) => {
    const response = await api.post('/matching/invite', { opportunityId, volunteerId });
    return response.data;
  }
};

// Volunteer API endpoints
export const volunteerAPI = {
  // Dashboard data
  getDashboardStats: async () => {
    const response = await api.get('/volunteer/dashboard-stats');
    return response.data;
  },

  // Analytics  
  getAnalytics: async () => {
    const response = await api.get('/volunteer/analytics');
    return response.data;
  },

  // Opportunity browsing
  getAllOpportunities: async (params = {}, config = {}) => {
    const response = await api.get('/volunteer/opportunities', { params, ...config });
    return response.data;
  },

  getOpportunityDetails: async (opportunityId) => {
    const response = await api.get(`/volunteer/opportunities/${opportunityId}`);
    return response.data;
  },

  getRecommendedOpportunities: async () => {
    const response = await api.get('/volunteer/opportunities/recommended');
    return response.data;
  },

  // Application management
  applyForOpportunity: async (opportunityId, applicationData = {}) => {
    const response = await api.post(`/volunteer/opportunities/${opportunityId}/apply`, applicationData);
    return response.data;
  },

  getMyApplications: async () => {
    const response = await api.get('/volunteer/applications');
    return response.data;
  },

  withdrawApplication: async (applicationId) => {
    const response = await api.delete(`/volunteer/applications/${applicationId}`);
    return response.data;
  },

  // Profile and notifications
  getProfile: async () => {
    const response = await api.get('/volunteer/profile');
    return response.data;
  },
  updateProfile: async (profileData) => {
    const response = await api.put('/volunteer/profile', profileData);
    return response.data;
  },
  initiateEmailChange: async (newEmail) => {
    const response = await api.post('/volunteer/profile/email-change', { newEmail });
    return response.data;
  },
  verifyEmailChange: async (otp) => {
    const response = await api.post('/volunteer/profile/email-change/verify', { otp });
    return response.data;
  },
  resendEmailChangeOtp: async () => {
    const response = await api.post('/volunteer/profile/email-change/resend');
    return response.data;
  },

  getNotifications: async () => {
    const response = await api.get('/volunteer/notifications');
    return response.data;
  },

  // Matching functionality
  getMatchingOpportunities: async (limit = 10) => {
    const response = await api.get(`/matching/opportunities?limit=${limit}`);
    return response.data;
  },

  updatePreferences: async (preferences) => {
    const response = await api.put('/matching/preferences', preferences);
    return response.data;
  }
};

// --- Interceptors for Logging (from main branch) ---
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Global blocked user handler (will be set by BlockedUserContext)
let globalBlockedUserHandler = null;
let hasHandledBlockedUser = false; // Flag to prevent duplicate handling

// Function to set the global handler
export const setGlobalBlockedUserHandler = (handler) => {
  globalBlockedUserHandler = handler;
};

// Function to reset the blocked user flag (call this on logout/login)
export const resetBlockedUserFlag = () => {
  hasHandledBlockedUser = false;
};

// Function to check current user status (to verify if still blocked)
export const checkUserStatus = async () => {
  try {
    // Call a protected endpoint WITHOUT our response interceptor to get authoritative status
    const response = await bareApi.get('/users');
    // If we get here, request succeeded and user is not blocked
    return { success: true, isBlocked: false, user: response.data };
  } catch (error) {
    const status = error?.response?.status;
    const data = error?.response?.data;
    if (status === 403 && data?.isBlocked) {
      // Server confirms blocked status
      return { success: true, isBlocked: true, blockReason: data.blockReason, blockedAt: data.blockedAt };
    }
    // Unknown error (network, 5xx, etc). Don't change state on caller side.
    return { success: false, isBlocked: null };
  }
};

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // Check if user is blocked
    if (error.response?.status === 403 && error.response?.data?.isBlocked) {
      console.log('🚫 BLOCKED USER DETECTED - Status 403 with isBlocked flag');
      
      // Check if current user is admin - admins should not be processed by blocked user detection
      let currentUser = null;
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          currentUser = JSON.parse(userStr);
          console.log('👤 Found user in localStorage:', currentUser);
          
          // Skip blocked user processing for admin users
          if (currentUser.role === 'admin') {
            console.log('🔑 User is admin - skipping blocked user processing');
            return Promise.reject(error); // Pass through the original error for admin users
          }
        }
      } catch (parseError) {
        console.error('❌ Error parsing user from localStorage:', parseError);
      }
      
      // Immediately set the flag to prevent more requests (only for non-admin users)
      if (!hasHandledBlockedUser) {
        hasHandledBlockedUser = true;
        console.log('🛑 First time blocked user detection - processing...');
        
        // Call global blocked user handler if available
        if (globalBlockedUserHandler) {
          console.log('📞 Calling global blocked user handler...');
          globalBlockedUserHandler(error.response.data, currentUser);
        } else {
          console.error('❌ No global blocked user handler available!');
        }
      } else {
        console.log('⚠️ Blocked user already handled, skipping duplicate processing');
      }
      
      // Always reject but PRESERVE original error so callers can inspect response
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

// Notification API
export const notificationAPI = {
  getNotifications: async (page = 1, limit = 20) => {
    const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.patch('/notifications/mark-all-read');
    return response.data;
  },

  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  }
};

// Matching API
export const matchingAPI = {
  // Get matching opportunities for volunteers
  getMatchingOpportunities: async (limit = 10) => {
    const response = await api.get(`/matching/opportunities?limit=${limit}`);
    return response.data;
  },

  // Get matching volunteers for NGOs
  getMatchingVolunteers: async (opportunityId, limit = 20) => {
    const response = await api.get(`/matching/volunteers/${opportunityId}?limit=${limit}`);
    return response.data;
  },

  // Update volunteer preferences
  updateVolunteerPreferences: async (preferences) => {
    const response = await api.put('/matching/preferences', preferences);
    return response.data;
  },

  // Invite volunteer to opportunity (NGO only)
  inviteVolunteer: async (opportunityId, volunteerId) => {
    const response = await api.post('/matching/invite', { opportunityId, volunteerId });
    return response.data;
  }
};

// Admin API
export const adminAPI = {
  // Profile management
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  // Dashboard analytics
  getDashboardAnalytics: async () => {
    const response = await api.get('/admin/analytics');
    return response.data;
  },

  // Analytics for WasteZeroAnalytics component (separate from dashboard)
  getAnalytics: async (timeRange = 'month') => {
    const response = await api.get(`/users/admin/analytics?timeRange=${timeRange}`);
    return response.data;
  },

  getNGOAnalytics: async (ngoId, timeRange = 'month') => {
    const response = await api.get(`/users/admin/analytics/ngo/${ngoId}?timeRange=${timeRange}`);
    return response.data;
  },

  getVolunteerAnalytics: async (volunteerId) => {
    const response = await api.get(`/users/admin/analytics/volunteer/${volunteerId}`);
    return response.data;
  },

  getPlatformStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // User management
  getAllUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/users?${queryString}`);
    return response.data;
  },

  getUserDetails: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  toggleUserBlock: async (userId, reason = '') => {
    const response = await api.patch(`/admin/users/${userId}/toggle-block`, { reason });
    return response.data;
  },

  // Chat functionality
  getAdminConversations: async () => {
    const response = await api.get('/admin/conversations');
    return response.data;
  },

  startConversation: async (userId) => {
    const response = await api.post(`/admin/conversations/${userId}`);
    return response.data;
  },

  getConversationMessages: async (conversationId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/conversations/${conversationId}/messages?${queryString}`);
    return response.data;
  },

  sendMessage: async (conversationId, content) => {
    const response = await api.post(`/admin/conversations/${conversationId}/messages`, { content });
    return response.data;
  }
};

// Pickup API
export const pickupAPI = {
  // Get all pickups for current user
  getMyPickups: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/pickups?${queryString}`);
    return response.data;
  },

  // Get pickup by ID
  getPickupById: async (pickupId) => {
    const response = await api.get(`/pickups/${pickupId}`);
    return response.data;
  },

  // Create new pickup request (volunteers only)
  createPickup: async (pickupData) => {
    const response = await api.post('/pickups', pickupData);
    return response.data;
  },

  // Update pickup
  updatePickup: async (pickupId, pickupData) => {
    const response = await api.put(`/pickups/${pickupId}`, pickupData);
    return response.data;
  },

  // Accept pickup request (NGO only)
  acceptPickup: async (pickupId) => {
    const response = await api.post(`/pickups/${pickupId}/accept`);
    return response.data;
  },

  // Get available agents (for NGOs)
  getAvailableAgents: async () => {
    const response = await api.get('/users/agents');
    return response.data;
  },

  // Assign agent to pickup (NGO only)
  assignAgent: async (pickupId, agentId) => {
    const response = await api.post(`/pickups/${pickupId}/assign-agent`, { agentId });
    return response.data;
  },

  // Cancel pickup
  cancelPickup: async (pickupId, reason = '') => {
    const response = await api.post(`/pickups/${pickupId}/cancel`, { reason });
    return response.data;
  },

  // Update pickup status (agent only)
  updatePickupStatus: async (pickupId, statusData) => {
    const response = await api.post(`/pickups/${pickupId}/status`, statusData);
    return response.data;
  },

  // Get pickup statistics
  getPickupStats: async () => {
    const response = await api.get('/pickups/stats');
    return response.data;
  }
};

export default api;
