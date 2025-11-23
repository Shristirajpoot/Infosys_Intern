import React, { useState, useEffect } from "react";
import { Bell, Check, Trash2, Search, Moon, Sun } from "lucide-react";
import { toast } from 'react-hot-toast';
import { useNotifications } from '../contexts/NotificationContext';

// Child component for a single notification
function NotificationItem({ notification, onMarkAsRead, onDelete }) {
  const handleMarkAsRead = async (e) => {
    e.stopPropagation();
    try {
      await onMarkAsRead(notification._id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    try {
      await onDelete(notification._id);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'application_received': return '#2f6ce1';
      case 'application_approved': return '#13C4A3';
      case 'application_rejected': return '#EA5252';
      case 'event_reminder': return '#FFBA08';
      default: return '#6b7280';
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMs = now - notificationDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  return (
    <tr className={`${notification.isRead ? "bg-white dark:bg-gray-800" : "bg-blue-50 dark:bg-blue-900/20"} hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors`}>
      <td className="py-4 px-3 align-top rounded-l-lg">
        <div className="flex items-start">
          <span
            className="inline-block w-3 h-3 rounded-full mt-1 mr-3 flex-shrink-0"
            style={{ background: getNotificationColor(notification.type) }}
          ></span>
          <div className="flex-1 min-w-0">
            <span className={`block font-semibold ${notification.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
              {notification.title}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400 mt-1 block">{notification.message}</span>
            {notification.sender && (
              <span className="text-xs text-gray-500 dark:text-gray-500 mt-1 block">
                From: {notification.sender.name}
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="py-4 px-3 align-top">
        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
          {notification.type.replace('_', ' ')}
        </span>
      </td>
      <td className="py-4 px-3 align-top">
        <span className="text-sm text-gray-600 dark:text-gray-400">{formatTime(notification.createdAt)}</span>
      </td>
      <td className="py-4 px-3 align-top rounded-r-lg">
        <div className="flex items-center gap-2">
          {!notification.isRead && (
            <button
              onClick={handleMarkAsRead}
              className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded transition-colors"
              title="Mark as read"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleDelete}
            className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded transition-colors"
            title="Delete notification"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function NotificationsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState('all'); // all, unread, read
  const { 
    notifications, 
    unreadCount, 
    loading, 
    loadNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();
  // const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  // // --- Dark Mode Logic ---
  // const toggleTheme = () => {
  //     const newTheme = theme === 'light' ? 'dark' : 'light';
  //     setTheme(newTheme);
  //     localStorage.setItem('theme', newTheme);
  // };

  // useEffect(() => {
  //     if (theme === 'dark') {
  //         document.documentElement.classList.add('dark');
  //     } else {
  //         document.documentElement.classList.remove('dark');
  //     }
  // }, [theme]);
  // // --- End Dark Mode Logic ---

  // Load notifications on mount
  useEffect(() => {
    loadNotifications();
  }, []);

  // Handle mark as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all notifications as read');
    }
  };

  // Handle delete
  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((n) => {
    const matchesSearch = (n.title + " " + n.message + " " + n.type)
      .toLowerCase()
      .includes(search.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !n.isRead) || 
      (filter === 'read' && n.isRead);
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-3">
              <Bell className="w-6 h-6" />
              Notifications
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
            <div className="text-gray-500 dark:text-gray-400 text-sm">
              Stay updated with the latest notifications
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
                <button
                onClick={handleMarkAllAsRead}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                <Check className="w-4 h-4" />
                Mark All Read
                </button>
            )}
            {/* <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                {theme === 'light' ? <Moon className="w-5 h-5 text-gray-600" /> : <Sun className="w-5 h-5 text-yellow-400" />}
            </button> */}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              className="w-full py-2 pl-10 pr-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors dark:placeholder-gray-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors"
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>

        {/* Notifications Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="p-6">
            <div className="w-full overflow-x-auto">
              <table className="w-full border-separate" style={{ borderSpacing: '0px 8px' }}>
                <thead>
                  <tr>
                    <th className="text-sm font-semibold text-gray-600 dark:text-gray-400 text-left pb-2">Notification</th>
                    <th className="text-sm font-semibold text-gray-600 dark:text-gray-400 text-left pb-2">Type</th>
                    <th className="text-sm font-semibold text-gray-600 dark:text-gray-400 text-left pb-2">Time</th>
                    <th className="text-sm font-semibold text-gray-600 dark:text-gray-400 text-left pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => (
                      <NotificationItem
                        key={notification._id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
                      />
                    ))
                  ) : (
                    <tr>
                      <td className="py-8 px-2 align-top text-center text-gray-500 dark:text-gray-400" colSpan={4}>
                        <Bell className="w-8 h-8 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                        <p className="text-lg font-medium mb-1">No notifications found</p>
                        <p className="text-sm">
                          {search ? 'Try adjusting your search terms.' : 'You\'re all caught up!'}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
