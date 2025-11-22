

import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Leaf, Trash2, Users, Award, TreePine, Recycle, MapPin, Clock, Calendar, Target, TrendingUp, Sparkles, BarChart3, Activity, Eye, RefreshCw, PieChart as PieChartIcon, Download, FileText } from 'lucide-react';
import { ngoAPI, adminAPI, volunteerAPI } from '../services/api';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const WasteZeroAnalytics = ({ userRole = 'volunteer', userId = null }) => {
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewMode, setViewMode] = useState('overview');

  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      let response;
      
      console.log('🔄 Loading analytics for user role:', userRole, 'Time range:', timeRange);
      
      if (userRole === 'admin') {
        response = await adminAPI.getAnalytics(timeRange);
      } else if (userRole === 'ngo') {
        console.log('📞 Calling NGO analytics API...');
        response = await ngoAPI.getAnalytics(timeRange);
      } else if (userRole === 'volunteer') {
        response = await volunteerAPI.getAnalytics();
      }
      
      console.log('📊 Analytics API response:', response);
      
      if (response && response.success && response.data) {
        console.log('✅ Setting real analytics data:');
        console.log('📊 Overview:', response.data.overview);
        console.log('📈 Monthly data:', response.data.monthlyData?.length, 'entries');
        console.log('🏷️ Activity types:', response.data.activityTypeData?.length, 'categories');
        console.log('👥 Top volunteers:', response.data.topVolunteers?.length, 'volunteers');
        setAnalyticsData(response.data);
      } else {
        console.log('⚠️ Analytics response not successful or no data, using fallback data');
        console.log('Response details:', { 
          hasResponse: !!response, 
          success: response?.success, 
          hasData: !!response?.data 
        });
        setAnalyticsData(generateFallbackData());
      }
    } catch (error) {
      console.error('❌ Error loading analytics:', error);
      console.log('🔧 Using fallback data due to error');
      setAnalyticsData(generateFallbackData());
    } finally {
      setLoading(false);
    }
  }, [userRole, timeRange]);

  const generateFallbackData = () => {
    const currentDate = new Date();
    const monthlyData = [];
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      monthlyData.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        events: Math.floor(Math.random() * 5) + 1,
        applications: Math.floor(Math.random() * 8) + 2,
        accepted: Math.floor(Math.random() * 5) + 1,
        volunteers: Math.floor(Math.random() * 15) + 3,
        waste: Math.floor(Math.random() * 200) + 50,
        hours: Math.floor(Math.random() * 80) + 20
      });
    }

    const activityTypeData = [
      { name: 'Environmental', value: 45, count: 18 },
      { name: 'Community', value: 25, count: 10 },
      { name: 'Education', value: 20, count: 8 },
      { name: 'Health', value: 10, count: 4 }
    ];

    const overview = {
      totalVolunteers: 12,
      totalEvents: 8,
      totalVolunteerHours: 180,
      wasteCollected: 240,
      treesPlanted: 15,
      co2Saved: 120,
      totalApplications: 40,
      acceptedApplications: 28,
      pendingApplications: 8,
      rejectedApplications: 4
    };

    const topVolunteers = [
      { id: 1, name: 'Alice Johnson', eventsParticipated: 5, totalHours: 25 },
      { id: 2, name: 'Bob Smith', eventsParticipated: 4, totalHours: 20 },
      { id: 3, name: 'Carol Davis', eventsParticipated: 3, totalHours: 18 }
    ];

    const recentActivities = [
      { id: 1, event: 'Community Garden Project', status: 'accepted', date: new Date(), location: 'Green Valley' },
      { id: 2, event: 'River Cleanup Drive', status: 'pending', date: new Date(), location: 'Riverside Park' },
      { id: 3, event: 'Recycling Workshop', status: 'accepted', date: new Date(), location: 'Community Center' }
    ];

    return {
      overview,
      monthlyData,
      activityTypeData,
      topVolunteers,
      recentActivities
    };
  };

  const loadUserAnalytics = async (targetUserId, targetUserRole) => {
    try {
      setLoading(true);
      let response;
      
      if (targetUserRole === 'ngo') {
        response = await adminAPI.getNGOAnalytics(targetUserId, timeRange);
      } else {
        response = await adminAPI.getVolunteerAnalytics(targetUserId);
      }
      
      if (response.success) {
        setSelectedUser(response.data);
        setViewMode('user-detail');
      } else {
        toast.error('Failed to load user analytics');
      }
    } catch (error) {
      console.error('Error loading user analytics:', error);
      toast.error('Failed to load user analytics');
    } finally {
      setLoading(false);
    }
  };

  const exportAnalyticsReport = async () => {
    try {
      toast.info('Generating analytics report... Please wait.');
      
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const { overview = {}, monthlyData = [], activityTypeData = [] } = analyticsData || {};
      
      const reportContent = `
        <html>
          <head>
            <title>WasteZero Analytics Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #16a34a; padding-bottom: 20px; }
              .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
              .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; background: #f9f9f9; }
              .stat-value { font-size: 24px; font-weight: bold; color: #16a34a; }
              .stat-label { font-size: 12px; color: #666; text-transform: uppercase; }
              .section { margin: 30px 0; }
              .section h2 { color: #16a34a; border-bottom: 1px solid #16a34a; padding-bottom: 10px; }
              .activity-list { list-style: none; padding: 0; }
              .activity-item { background: #f8f9fa; margin: 8px 0; padding: 10px; border-radius: 5px; border-left: 4px solid #16a34a; }
              .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🌱 WasteZero Analytics Report</h1>
              <p>Generated on ${currentDate}</p>
              <p>Analytics for ${userRole.toUpperCase()} Dashboard</p>
            </div>
            
            <div class="section">
              <h2>📊 Key Metrics</h2>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-value">${overview.totalVolunteers || overview.totalUsers || 0}</div>
                  <div class="stat-label">${userRole === 'admin' ? 'Total Users' : 'Volunteers'}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${overview.totalEvents || overview.totalVolunteerHours || 0}</div>
                  <div class="stat-label">${userRole === 'admin' ? 'Total Events' : 'Volunteer Hours'}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${overview.wasteCollected || 0}kg</div>
                  <div class="stat-label">Waste Collected</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${overview.treesPlanted || 0}</div>
                  <div class="stat-label">Trees Planted</div>
                </div>
              </div>
            </div>
            
            <div class="section">
              <h2>📈 Monthly Activity</h2>
              <ul class="activity-list">
                ${monthlyData.slice(0, 6).map(item => `
                  <li class="activity-item">
                    <strong>${item.month}</strong>: 
                    ${item.events || item.applications || 0} 
                    ${userRole === 'ngo' ? 'events created' : userRole === 'volunteer' ? 'applications submitted' : 'activities'}
                  </li>
                `).join('')}
              </ul>
            </div>
            
            <div class="section">
              <h2>🏷️ Activity Categories</h2>
              <ul class="activity-list">
                ${activityTypeData.map(category => `
                  <li class="activity-item">
                    <strong>${category.name}</strong>: ${category.value}% (${category.count || 0} activities)
                  </li>
                `).join('')}
              </ul>
            </div>
            
            <div class="footer">
              <p>This report was automatically generated by WasteZero Analytics</p>
              <p>For support, contact: support@wastezero.com</p>
            </div>
          </body>
        </html>
      `;
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Pop-up blocked. Please allow pop-ups and try again.');
      }
      
      printWindow.document.write(reportContent);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        
        setTimeout(() => {
          printWindow.close();
        }, 100);
      }, 500);
      
      toast.success('📄 Analytics report generated successfully!');
      
    } catch (error) {
      console.error('Error exporting analytics report:', error);
      toast.error('Failed to generate report. Please try again.');
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-purple-600" />
          </div>
          <span className="text-gray-700 dark:text-gray-200 font-semibold text-lg">Loading your analytics...</span>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center max-w-md">
          <div className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-12 h-12 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">No Analytics Available</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">We couldn't load your analytics data right now</p>
          <button
            onClick={loadAnalyticsData}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-full hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 font-semibold shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (viewMode === 'user-detail' && selectedUser) {
    return (
      <div className="space-y-8">
        {/* Back Button and Header */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-2xl p-8 shadow-2xl">
          <button
            onClick={() => setViewMode('overview')}
            className="mb-4 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg transition-all flex items-center space-x-2"
          >
            <span>←</span>
            <span>Back to Overview</span>
          </button>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {selectedUser.volunteer ? selectedUser.volunteer.name : selectedUser.ngo.name}
              </h1>
              <p className="text-purple-100 text-lg">Detailed Analytics & Performance</p>
            </div>
            <div className="text-right bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
              <p className="text-sm text-purple-100 uppercase tracking-wide">Impact Score</p>
              <p className="text-3xl font-bold text-white">{selectedUser.stats.impactScore || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* User Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl shadow-xl p-6 text-white">
            <Calendar className="h-10 w-10 mb-4 opacity-80" />
            <p className="text-4xl font-bold mb-1">{selectedUser.stats.totalApplications || selectedUser.stats.totalEvents}</p>
            <p className="text-sm opacity-90 uppercase tracking-wide">{selectedUser.volunteer ? 'Applications' : 'Events'}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-xl p-6 text-white">
            <Clock className="h-10 w-10 mb-4 opacity-80" />
            <p className="text-4xl font-bold mb-1">{selectedUser.stats.hoursVolunteered || selectedUser.stats.totalVolunteerHours}</p>
            <p className="text-sm opacity-90 uppercase tracking-wide">Hours</p>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl shadow-xl p-6 text-white">
            <Trash2 className="h-10 w-10 mb-4 opacity-80" />
            <p className="text-4xl font-bold mb-1">{selectedUser.stats.wasteCollected}kg</p>
            <p className="text-sm opacity-90 uppercase tracking-wide">Waste Collected</p>
          </div>

          <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl shadow-xl p-6 text-white">
            <TreePine className="h-10 w-10 mb-4 opacity-80" />
            <p className="text-4xl font-bold mb-1">{selectedUser.stats.treesPlanted}</p>
            <p className="text-sm opacity-90 uppercase tracking-wide">Trees Planted</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Monthly Activity Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 border-purple-100 dark:border-purple-900">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 mr-3 text-purple-600" />
              Monthly Performance
            </h3>
            {(selectedUser.monthlyData && selectedUser.monthlyData.length > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={selectedUser.monthlyData}>
                  <defs>
                    <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" fontSize={12} stroke="#6b7280" />
                  <YAxis fontSize={12} stroke="#6b7280" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '2px solid #8b5cf6' }} />
                  <Area 
                    type="monotone" 
                    dataKey={selectedUser.volunteer ? "applications" : "events"} 
                    stroke="#8b5cf6" 
                    fillOpacity={1}
                    fill="url(#colorActivity)" 
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 rounded-xl">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-purple-300 dark:text-purple-700 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300 font-semibold text-lg">No Activity Data</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Start tracking to see your progress</p>
                </div>
              </div>
            )}
          </div>

          {/* Recent Activities */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 border-blue-100 dark:border-blue-900">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
              <Activity className="w-6 h-6 mr-3 text-blue-600" />
              Recent Activity
            </h3>
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
              {(selectedUser.recentActivities && selectedUser.recentActivities.length > 0) ? 
                selectedUser.recentActivities.map((activity, index) => (
                  <div key={index} className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20 rounded-xl p-4 border-l-4 border-blue-500 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm flex-1">
                        {activity.type === 'Event Created' ? activity.event : 
                         activity.user ? `${activity.user} applied for ${activity.event}` : activity.event}
                      </p>
                      <span className={`text-xs px-3 py-1 rounded-full font-bold ml-3 ${
                        activity.status === 'accepted' || activity.status === 'active' ? 'bg-emerald-500 text-white' :
                        activity.status === 'pending' ? 'bg-amber-500 text-white' :
                        'bg-rose-500 text-white'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-blue-600 dark:text-blue-400">{activity.type}</span>
                      <span>{new Date(activity.date).toLocaleDateString()}</span>
                    </div>
                    {activity.location && (
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{activity.location}</span>
                      </div>
                    )}
                  </div>
                )) :
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 mx-auto mb-4 text-blue-300 dark:text-blue-700" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No Recent Activities</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Your activities will appear here</p>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { 
    overview = {}, 
    monthlyData = [], 
    activityTypeData = [], 
    recentActivities = [], 
    topVolunteers = [], 
    userGrowthData = [], 
    eventActivityData = [], 
    topNGOs = [], 
    categoryDistribution = [] 
  } = analyticsData || {};

  console.log('🔍 Analytics data received:', analyticsData);
  console.log('📊 Monthly data:', monthlyData, 'Length:', monthlyData?.length);
  console.log('🏷️ Activity type data:', activityTypeData, 'Length:', activityTypeData?.length);
  console.log('👤 User role:', userRole);
  console.log('📈 Chart data validation:', {
    monthlyDataValid: Array.isArray(monthlyData) && monthlyData.length > 0,
    activityDataValid: Array.isArray(activityTypeData) && activityTypeData.length > 0
  });

  return (
    <div className="space-y-8">
      {/* Hero Header Section */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-3xl p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-4xl font-bold text-white mb-2 flex items-center">
              <Sparkles className="w-8 h-8 mr-3" />
              {userRole === 'admin' ? 'Platform Dashboard' : 
               userRole === 'ngo' ? 'NGO Dashboard' : 'Your Impact Dashboard'}
            </h2>
            <p className="text-purple-100 text-lg">Track your environmental impact in real-time</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadAnalyticsData}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl transition-all flex items-center space-x-2 font-semibold"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={exportAnalyticsReport}
              className="bg-white text-purple-600 px-5 py-2.5 rounded-xl hover:bg-purple-50 transition-all flex items-center space-x-2 font-semibold shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl px-4 py-2.5 font-semibold focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="week" className="text-gray-900">7 Days</option>
              <option value="month" className="text-gray-900">1 Month</option>
              <option value="quarter" className="text-gray-900">3 Months</option>
              <option value="year" className="text-gray-900">1 Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
          <Users className="h-10 w-10 mb-4 opacity-80" />
          <p className="text-4xl font-bold mb-1">
            {userRole === 'admin' ? (overview.totalUsers || 0) : 
             userRole === 'ngo' ? (overview.totalVolunteers || 0) : 
             (overview.totalApplications || 0)}
          </p>
          <p className="text-sm opacity-90 uppercase tracking-wide">
            {userRole === 'admin' ? 'Total Users' : 
             userRole === 'ngo' ? 'Volunteers' : 
             'Applications'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
          <Clock className="h-10 w-10 mb-4 opacity-80" />
          <p className="text-4xl font-bold mb-1">
            {userRole === 'admin' ? (overview.totalEvents || 0) : 
             (overview.totalVolunteerHours || 0)}
          </p>
          <p className="text-sm opacity-90 uppercase tracking-wide">
            {userRole === 'admin' ? 'Total Events' : 'Volunteer Hours'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
          <Trash2 className="h-10 w-10 mb-4 opacity-80" />
          <p className="text-4xl font-bold mb-1">{overview.wasteCollected || 0}kg</p>
          <p className="text-sm opacity-90 uppercase tracking-wide">Waste Collected</p>
        </div>

        <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
          <TreePine className="h-10 w-10 mb-4 opacity-80" />
          <p className="text-4xl font-bold mb-1">{overview.treesPlanted || 0}</p>
          <p className="text-sm opacity-90 uppercase tracking-wide">Trees Planted</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Main Activity Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 border-purple-100 dark:border-purple-900">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 mr-3 text-purple-600" />
            {userRole === 'admin' ? 'Platform Growth' : 
             userRole === 'ngo' ? 'Events Created' : 'My Applications'}
          </h3>
          {userRole === 'admin' ? 
            (userGrowthData && userGrowthData.length > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userGrowthData}>
                  <defs>
                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.9}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" fontSize={12} stroke="#6b7280" />
                  <YAxis fontSize={12} stroke="#6b7280" />
                  <Tooltip 
                    formatter={(value, name) => [value, 'New Users']}
                    contentStyle={{ borderRadius: '12px', border: '2px solid #8b5cf6' }}
                  />
                  <Bar 
                    dataKey="users" 
                    fill="url(#colorBar)" 
                    radius={[8, 8, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 rounded-xl">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-purple-300 dark:text-purple-700" />
                  <p className="text-gray-600 dark:text-gray-300 font-semibold">No growth data yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Users will appear as they register</p>
                </div>
              </div>
            )
            :
            (monthlyData && monthlyData.length > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.9}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" fontSize={12} stroke="#6b7280" />
                  <YAxis fontSize={12} stroke="#6b7280" />
                  <Tooltip 
                    formatter={(value, name) => [
                      value, 
                      userRole === 'ngo' ? 'Events Created' : 'Applications'
                    ]}
                    contentStyle={{ borderRadius: '12px', border: '2px solid #8b5cf6' }}
                  />
                  <Bar 
                    dataKey={userRole === 'ngo' ? 'events' : 'applications'} 
                    fill="url(#colorBar)" 
                    radius={[8, 8, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 rounded-xl">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-purple-300 dark:text-purple-700" />
                  <p className="text-gray-600 dark:text-gray-300 font-semibold">{userRole === 'volunteer' ? 'No applications yet' : 'No events yet'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {userRole === 'volunteer' ? 'Start applying to events' : 'Create your first event'}
                  </p>
                </div>
              </div>
            )}
        </div>

        {/* Activity Distribution Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 border-blue-100 dark:border-blue-900">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
            <PieChartIcon className="w-6 h-6 mr-3 text-blue-600" />
            {userRole === 'admin' ? 'Event Categories' : 
             userRole === 'ngo' ? 'My Event Types' : 'Participation Categories'}
          </h3>
          {(activityTypeData && activityTypeData.length > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={activityTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  labelLine={false}
                >
                  {activityTypeData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`hsl(${(index * 137.5) % 360}, 70%, 50%)`}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value}%`, `${name}`]} 
                  contentStyle={{ borderRadius: '12px', border: '2px solid #3b82f6' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl">
              <div className="text-center">
                <PieChartIcon className="w-16 h-16 mx-auto mb-4 text-blue-300 dark:text-blue-700" />
                <p className="text-gray-600 dark:text-gray-300 font-semibold">{userRole === 'volunteer' ? 'No participation yet' : 'No categories yet'}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {userRole === 'volunteer' ? 'Join events to see breakdown' : 'Add event categories'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Three Column Section */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Top Performers / NGOs / Volunteers */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 border-indigo-100 dark:border-indigo-900">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
            <Award className="w-6 h-6 mr-3 text-indigo-600" />
            {userRole === 'admin' ? 'Top NGOs' : 
             userRole === 'ngo' ? 'Star Volunteers' : 'Partner NGOs'}
          </h3>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {userRole === 'admin' ?
              (analyticsData?.topNGOs && analyticsData.topNGOs.length > 0) ? 
                analyticsData.topNGOs.slice(0, 5).map((ngo, index) => (
                  <div 
                    key={index} 
                    className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer border-l-4 border-indigo-500"
                    onClick={() => loadUserAnalytics(ngo.id, 'ngo')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-gray-100">{ngo.name || 'Unknown NGO'}</p>
                        <p className="text-sm text-indigo-600 dark:text-indigo-400">{ngo.totalEvents} events created</p>
                      </div>
                      <Eye className="h-5 w-5 text-indigo-400" />
                    </div>
                  </div>
                )) :
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto mb-4 text-indigo-300 dark:text-indigo-700" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No NGOs yet</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Waiting for registrations</p>
                </div>
            : userRole === 'volunteer' ? 
              (analyticsData?.ngosWorkedWith && analyticsData.ngosWorkedWith.length > 0) ? 
                analyticsData.ngosWorkedWith.slice(0, 5).map((ngo, index) => (
                  <div key={index} className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 hover:shadow-lg transition-all border-l-4 border-indigo-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-gray-100">{ngo.name || 'Unknown NGO'}</p>
                        <p className="text-sm text-indigo-600 dark:text-indigo-400">Partner NGO</p>
                      </div>
                    </div>
                  </div>
                )) :
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto mb-4 text-indigo-300 dark:text-indigo-700" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No partnerships yet</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Apply to events</p>
                </div>
              :
              (analyticsData?.topVolunteers && analyticsData.topVolunteers.length > 0) ?
                analyticsData.topVolunteers.slice(0, 5).map((volunteer, index) => (
                  <div 
                    key={index} 
                    className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer border-l-4 border-indigo-500"
                    onClick={() => userRole === 'admin' && loadUserAnalytics(volunteer.id || volunteer._id, 'volunteer')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-gray-100">
                          {volunteer.name || 'Unknown Volunteer'}
                        </p>
                        <p className="text-sm text-indigo-600 dark:text-indigo-400">
                          {volunteer.eventsParticipated || 0} events
                        </p>
                      </div>
                      {userRole === 'admin' && (
                        <Eye className="h-5 w-5 text-indigo-400" />
                      )}
                    </div>
                  </div>
                )) :
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto mb-4 text-indigo-300 dark:text-indigo-700" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No volunteers yet</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Create events to attract</p>
                </div>
            }
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 border-teal-100 dark:border-teal-900">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
            <Activity className="w-6 h-6 mr-3 text-teal-600" />
            {userRole === 'volunteer' ? 'My Applications' : 'Recent Activity'}
          </h3>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {userRole === 'volunteer' ? 
              (analyticsData?.recentActivities || []).map((activity, index) => (
                <div key={index} className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl p-4 hover:shadow-lg transition-all border-l-4 border-teal-500">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm flex-1">{activity.event}</p>
                    <span className={`text-xs px-3 py-1 rounded-full font-bold ml-3 ${
                      activity.status === 'accepted' ? 'bg-emerald-500 text-white' :
                      activity.status === 'pending' ? 'bg-amber-500 text-white' :
                      'bg-rose-500 text-white'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">{new Date(activity.appliedDate).toLocaleDateString()}</p>
                  {activity.location && (
                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mt-2">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{activity.location}</span>
                    </div>
                  )}
                </div>
              )) :
              (recentActivities || []).map((activity, index) => (
                <div key={activity.id || index} className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl p-4 hover:shadow-lg transition-all border-l-4 border-teal-500">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">
                        {activity.name || activity.description || activity.event}
                      </p>
                      <div className="flex items-center space-x-2 flex-wrap">
                        {activity.type && (
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            activity.type === 'Event Created' ? 'bg-emerald-500 text-white' :
                            activity.type === 'Application' ? 'bg-blue-500 text-white' :
                            activity.type === 'User Registration' ? 'bg-purple-500 text-white' :
                            'bg-gray-500 text-white'
                          }`}>
                            {activity.type}
                          </span>
                        )}
                        {activity.category && (
                          <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                            {activity.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-3">
                      {activity.status && (
                        <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                          activity.status === 'accepted' || activity.status === 'completed' || activity.status === 'active' ? 'bg-emerald-500 text-white' :
                          activity.status === 'pending' || activity.status === 'upcoming' ? 'bg-amber-500 text-white' :
                          'bg-rose-500 text-white'
                        }`}>
                          {activity.status}
                        </span>
                      )}
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(activity.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Environmental Impact */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl p-8 text-white">
          <h3 className="text-xl font-bold mb-6 flex items-center">
            <Leaf className="w-6 h-6 mr-3" />
            Environmental Impact
          </h3>
          <div className="space-y-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5 hover:bg-white/30 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/30 rounded-full p-2">
                    <Trash2 className="h-6 w-6" />
                  </div>
                  <span className="font-semibold">Waste Collected</span>
                </div>
                <span className="text-2xl font-bold">{overview.wasteCollected || 0}kg</span>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5 hover:bg-white/30 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/30 rounded-full p-2">
                    <TreePine className="h-6 w-6" />
                  </div>
                  <span className="font-semibold">Trees Planted</span>
                </div>
                <span className="text-2xl font-bold">{overview.treesPlanted || 0}</span>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5 hover:bg-white/30 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/30 rounded-full p-2">
                    <Leaf className="h-6 w-6" />
                  </div>
                  <span className="font-semibold">CO₂ Saved</span>
                </div>
                <span className="text-2xl font-bold">{overview.co2Saved || 0}kg</span>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5 hover:bg-white/30 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/30 rounded-full p-2">
                    <Clock className="h-6 w-6" />
                  </div>
                  <span className="font-semibold">Total Hours</span>
                </div>
                <span className="text-2xl font-bold">{overview.totalVolunteerHours || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WasteZeroAnalytics;
