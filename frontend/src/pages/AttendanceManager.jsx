

import React, { useState, useCallback, useEffect } from 'react';
import { Calendar, Users, Clock, Check, X, Download, UserCheck, AlertCircle, CheckCircle2, Moon, Sun, RefreshCw, TrendingUp } from 'lucide-react';
import { ngoAPI } from '../services/api';
import { toast } from 'react-toastify';

const AttendanceManager = ({ eventId, onClose }) => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
    
    if (type === 'success') {
      toast.success(message);
    } else if (type === 'error') {
      toast.error(message);
    } else {
      toast.info(message);
    }
  }, []);

  const loadAttendanceData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ngoAPI.getEventAttendance(eventId);
      if (response.success) {
        setAttendanceData(response.data);
      } else {
        showNotification('Failed to load attendance data', 'error');
      }
    } catch (error) {
      console.error('Error loading attendance:', error);
      showNotification('Failed to load attendance data', 'error');
    } finally {
      setLoading(false);
    }
  }, [eventId, showNotification]);

  const markAttendance = useCallback(async (volunteerId, status, notes = '') => {
    try {
      setActionLoading(true);
      const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      
      const response = await ngoAPI.markAttendance(eventId, volunteerId, {
        status,
        arrivalTime: (status === 'present' || status === 'late') ? currentTime : '',
        notes
      });

      if (response.success) {
        showNotification(response.message, 'success');
        await loadAttendanceData();
      } else {
        showNotification('Failed to mark attendance', 'error');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      showNotification('Failed to mark attendance', 'error');
    } finally {
      setActionLoading(false);
    }
  }, [eventId, loadAttendanceData, showNotification]);

  const markAllPresent = useCallback(async () => {
    try {
      setActionLoading(true);
      const response = await ngoAPI.markAllPresent(eventId, 'Bulk marked present by NGO');
      
      if (response.success) {
        showNotification(response.message, 'success');
        await loadAttendanceData();
      } else {
        showNotification('Failed to mark all present', 'error');
      }
    } catch (error) {
      console.error('Error marking all present:', error);
      showNotification('Failed to mark all present', 'error');
    } finally {
      setActionLoading(false);
    }
  }, [eventId, loadAttendanceData, showNotification]);

  const exportAttendanceCSV = useCallback(async () => {
    try {
      setActionLoading(true);
      await ngoAPI.exportAttendanceReport(eventId);
      showNotification('Attendance report exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting report:', error);
      showNotification('Failed to export attendance report', 'error');
    } finally {
      setActionLoading(false);
    }
  }, [eventId, showNotification]);

  useEffect(() => {
    if (eventId) {
      loadAttendanceData();
    }
  }, [eventId, loadAttendanceData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 dark:border-blue-900"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-600 dark:border-t-blue-400 absolute top-0 left-0"></div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700 dark:text-gray-300">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  if (!attendanceData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Unable to Load Data</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">We couldn't retrieve the attendance information</p>
          <button 
            onClick={loadAttendanceData}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-medium transition-all shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { event, volunteers, stats } = attendanceData;
  const attendanceRate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 rounded-2xl shadow-2xl p-8 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <UserCheck className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">Attendance Manager</h1>
              </div>
              <p className="text-blue-100 text-lg">Track and manage volunteer attendance seamlessly</p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-3 hover:bg-white/20 rounded-xl transition-all backdrop-blur-sm"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Event Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Event Details</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
              <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">Event Name</p>
                <p className="font-bold text-gray-900 dark:text-white text-lg">{event.title}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
              <div className="w-10 h-10 bg-green-600 dark:bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide mb-1">Event Date</p>
                <p className="font-bold text-gray-900 dark:text-white text-lg">{new Date(event.date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
              <div className="w-10 h-10 bg-purple-600 dark:bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-1">Location</p>
                <p className="font-bold text-gray-900 dark:text-white text-lg">{event.location}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Attendance Overview</h2>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
              <span className="text-sm font-medium text-white">Attendance Rate:</span>
              <span className="text-lg font-bold text-white">{attendanceRate}%</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="group hover:scale-105 transition-transform">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-8 h-8 text-white/80" />
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{stats.total}</span>
                  </div>
                </div>
                <div className="text-white/90 font-medium text-sm">Total Volunteers</div>
              </div>
            </div>

            <div className="group hover:scale-105 transition-transform">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle2 className="w-8 h-8 text-white/80" />
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{stats.present}</span>
                  </div>
                </div>
                <div className="text-white/90 font-medium text-sm">Present</div>
              </div>
            </div>

            <div className="group hover:scale-105 transition-transform">
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <X className="w-8 h-8 text-white/80" />
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{stats.absent}</span>
                  </div>
                </div>
                <div className="text-white/90 font-medium text-sm">Absent</div>
              </div>
            </div>

            <div className="group hover:scale-105 transition-transform">
              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-8 h-8 text-white/80" />
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{stats.late}</span>
                  </div>
                </div>
                <div className="text-white/90 font-medium text-sm">Late</div>
              </div>
            </div>

            <div className="group hover:scale-105 transition-transform">
              <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <AlertCircle className="w-8 h-8 text-white/80" />
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{stats.pending}</span>
                  </div>
                </div>
                <div className="text-white/90 font-medium text-sm">Pending</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={markAllPresent}
              disabled={actionLoading || volunteers.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg hover:shadow-xl"
            >
              <CheckCircle2 className="w-5 h-5" />
              Mark All Present
            </button>
            <button
              onClick={exportAttendanceCSV}
              disabled={actionLoading || volunteers.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg hover:shadow-xl"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
            <button
              onClick={loadAttendanceData}
              disabled={actionLoading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg hover:shadow-xl"
            >
              <RefreshCw className={`w-5 h-5 ${actionLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Volunteers Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Volunteers List</h2>
              <span className="ml-auto px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">
                {volunteers.length} volunteers
              </span>
            </div>
          </div>

          {volunteers.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-lg font-medium text-gray-600 dark:text-gray-400">No accepted volunteers yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Volunteers will appear here once they're accepted</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-6 font-semibold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider">Volunteer</th>
                    <th className="text-left py-4 px-6 font-semibold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                    <th className="text-left py-4 px-6 font-semibold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider">Arrival Time</th>
                    <th className="text-left py-4 px-6 font-semibold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {volunteers.map((volunteer, index) => (
                    <tr key={volunteer.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md">
                            {volunteer.volunteerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{volunteer.volunteerName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              Applied {new Date(volunteer.appliedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">{volunteer.email}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{volunteer.phone || 'No phone provided'}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${
                          volunteer.attendanceStatus === 'present' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                          volunteer.attendanceStatus === 'absent' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                          volunteer.attendanceStatus === 'late' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {volunteer.attendanceStatus === 'present' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {volunteer.attendanceStatus === 'absent' && <X className="w-3 h-3 mr-1" />}
                          {volunteer.attendanceStatus === 'late' && <Clock className="w-3 h-3 mr-1" />}
                          {volunteer.attendanceStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {volunteer.arrivalTime || <span className="text-gray-400">Not recorded</span>}
                        </p>
                        {volunteer.notes && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">{volunteer.notes}</p>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <button
                            onClick={() => markAttendance(volunteer.volunteerId, 'present')}
                            disabled={actionLoading}
                            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-md"
                          >
                            Present
                          </button>
                          <button
                            onClick={() => markAttendance(volunteer.volunteerId, 'late')}
                            disabled={actionLoading}
                            className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-md"
                          >
                            Late
                          </button>
                          <button
                            onClick={() => markAttendance(volunteer.volunteerId, 'absent')}
                            disabled={actionLoading}
                            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-md"
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notifications */}
      {notifications.map(n => (
        <div 
          key={n.id} 
          className={`fixed bottom-6 right-6 p-4 rounded-xl shadow-2xl z-50 backdrop-blur-sm animate-slide-up ${
            n.type === 'success' ? 'bg-green-500/90 text-white' :
            n.type === 'error' ? 'bg-red-500/90 text-white' :
            'bg-blue-500/90 text-white'
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {n.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
            {n.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {n.message}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AttendanceManager;
