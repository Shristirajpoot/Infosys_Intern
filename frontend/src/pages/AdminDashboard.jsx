import React, { useState, useEffect } from 'react'
import {  NavLink, Outlet, useLocation, useNavigate  } from 'react-router-dom'
// import { BarChart3, Users, TrendingUp } from 'lucide-react';
import {
    Users,
    Recycle,
    Calendar,
    BarChart3,
    TrendingUp,
    MapPin,
    MessageSquare,
    Settings,
    RefreshCw,
    Plus,
    X,
    Save,
    Leaf,
    Truck,
    Package,
    Clock,
    Phone,
    Mail,
    Eye,
    Edit,
    UserCheck,
    Navigation,
    Moon,
    Sun
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { toast } from 'react-toastify'
import { adminAPI, legacyAdminAPI } from '../services/api'
//import UsersPage from "./pages/UsersPage";
import WasteZeroAnalytics from './AnalyticDashboard'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const AdminDashboard = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const [isMobile, setIsMobile] = useState(false)
    const [activeTab, setActiveTab] = useState('dashboard') // dashboard, users, analytics
    
    // Get current user info to prevent self-blocking
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
    
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 1024 // lg breakpoint
            setIsMobile(mobile)
        }
        
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Real data states - no mock data
    const [stats, setStats] = useState([])
    const [recentActivities, setRecentActivities] = useState([])
    const [wasteCollectionData, setWasteCollectionData] = useState([])
    const [selectedPeriod, setSelectedPeriod] = useState('Month')

    // Platform Activity State
    const [platformActivity, setPlatformActivity] = useState({
        userDistribution: {
            ngos: 342,
            volunteers: 2201,
            total: 2543
        },
        engagement: {
            dailyActive: 1234,
            newToday: 45,
            growthRate: 12.5
        },
        systemHealth: {
            uptime: '99.9%',
            responseTime: '245ms',
            status: 'Healthy'
        }
    })

    // User Management State
    const [users, setUsers] = useState([])
    const [usersPagination, setUsersPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalUsers: 0
    })
    const [userFilters, setUserFilters] = useState({
        role: '',
        status: '',
        search: ''
    })
    const [selectedUser, setSelectedUser] = useState(null)
    const [showUserModal, setShowUserModal] = useState(false)
    const [showBlockModal, setShowBlockModal] = useState(false)
    const [blockReason, setBlockReason] = useState('')

    // Fetch dashboard data
    const fetchDashboardData = async () => {
        try {
            setLoading(true)
            setError(null)

            // Get analytics data
            const analyticsData = await adminAPI.getAnalytics()
            if (analyticsData.success) {
                const { overview, platformGrowth, recentActivities, monthlyData } = analyticsData.data
                
                // Update stats with real data
                setStats([
                    {
                        title: 'Total Users',
                        value: overview.totalUsers.toLocaleString(),
                        change: platformGrowth?.growthRate ? `+${platformGrowth.growthRate}%` : '+0%',
                        icon: Users,
                        color: 'bg-blue-500'
                    },
                    {
                        title: 'NGOs',
                        value: overview.totalNGOs.toLocaleString(),
                        change: '+5%',
                        icon: Recycle,
                        color: 'bg-green-500'
                    },
                    {
                        title: 'Volunteers',
                        value: overview.totalVolunteers.toLocaleString(),
                        change: '+8%',
                        icon: Calendar,
                        color: 'bg-orange-500'
                    },
                    {
                        title: 'Events',
                        value: overview.totalEvents.toString(),
                        change: '+12%',
                        icon: MapPin,
                        color: 'bg-purple-500'
                    }
                ])

                // Update platform activity data with real backend data
                setPlatformActivity({
                    userDistribution: {
                        ngos: overview.totalNGOs,
                        volunteers: overview.totalVolunteers,
                        total: overview.totalUsers
                    },
                    engagement: {
                        dailyActive: platformGrowth?.totalUsers || overview.totalUsers,
                        newToday: platformGrowth?.newUsers || 0,
                        growthRate: parseFloat(platformGrowth?.growthRate) || 0
                    },
                    systemHealth: {
                        uptime: '99.9%',
                        responseTime: '245ms',
                        status: 'Healthy'
                    }
                })

                // Update recent activities with real data from backend
                setRecentActivities(recentActivities || [])
                
                // Fetch waste collection data using dedicated API
                await fetchWasteCollectionData(selectedPeriod)
            }

            console.log('Dashboard data loaded successfully')
        } catch (err) {
            setError('Failed to load dashboard data')
            console.error('Error fetching dashboard data:', err)
        } finally {
            setLoading(false)
        }
    }

    // Export report function
    const handleExportReport = async () => {
        try {
            setLoading(true)
            toast.info('Generating PDF report... Please wait.')
            
            // Create a new window with the report content
            const printWindow = window.open('', '_blank')
            if (!printWindow) {
                throw new Error('Pop-up blocked. Please allow pop-ups and try again.')
            }
            
            // Get current date for the report
            const currentDate = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
            
            // Generate comprehensive report content
            const reportContent = `
                <html>
                    <head>
                        <title>WasteZero Admin Dashboard Report</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #16a34a; padding-bottom: 20px; }
                            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
                            .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; background: #f9f9f9; }
                            .stat-value { font-size: 24px; font-weight: bold; color: #16a34a; }
                            .stat-label { font-size: 14px; color: #666; text-transform: uppercase; }
                            .section { margin: 30px 0; }
                            .section h2 { color: #16a34a; border-bottom: 1px solid #16a34a; padding-bottom: 10px; }
                            .user-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                            .user-table th, .user-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                            .user-table th { background-color: #16a34a; color: white; }
                            .status-active { color: #16a34a; font-weight: bold; }
                            .status-blocked { color: #dc2626; font-weight: bold; }
                            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <h1>🌱 WasteZero Admin Dashboard Report</h1>
                            <p>Generated on ${currentDate}</p>
                            <p>Platform Overview & Analytics</p>
                        </div>
                        
                        <div class="section">
                            <h2>📊 Platform Statistics</h2>
                            <div class="stats-grid">
                                <div class="stat-card">
                                    <div class="stat-value">${usersPagination.totalUsers || 0}</div>
                                    <div class="stat-label">Total Users</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-value">${users.filter(u => u.role === 'ngo').length}</div>
                                    <div class="stat-label">NGOs</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-value">${users.filter(u => u.role === 'volunteer').length}</div>
                                    <div class="stat-label">Volunteers</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-value">${users.filter(u => u.isBlocked).length}</div>
                                    <div class="stat-label">Blocked Users</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="section">
                            <h2>🗂️ User Management Overview</h2>
                            <table class="user-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Location</th>
                                        <th>Joined Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${users.slice(0, 20).map(user => `
                                        <tr>
                                            <td>${user.name}</td>
                                            <td>${user.email}</td>
                                            <td>${user.role.toUpperCase()}</td>
                                            <td class="${user.isBlocked ? 'status-blocked' : 'status-active'}">
                                                ${user.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                                            </td>
                                            <td>${user.location || 'Not specified'}</td>
                                            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    `).join('')}
                                    ${users.length > 20 ? `<tr><td colspan="6" style="text-align: center; font-style: italic;">... and ${users.length - 20} more users</td></tr>` : ''}
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="section">
                            <h2>📈 Waste Collection Trends</h2>
                            ${wasteCollectionData.length > 0 ? `
                                <table class="user-table">
                                    <thead>
                                        <tr>
                                            <th>Period</th>
                                            <th>Waste Collected (kg)</th>
                                            <th>Events</th>
                                            <th>Participants</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${wasteCollectionData.slice(0, 10).map(item => `
                                            <tr>
                                                <td>${item.period}</td>
                                                <td>${item.wasteCollected || 0} kg</td>
                                                <td>${item.events || 0}</td>
                                                <td>${item.participants || 0}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            ` : '<p>No waste collection data available for the selected period.</p>'}
                        </div>
                        
                        <div class="section">
                            <h2>🎯 Platform Health</h2>
                            <div class="stats-grid">
                                <div class="stat-card">
                                    <div class="stat-value">${platformActivity.systemHealth.uptime}</div>
                                    <div class="stat-label">System Uptime</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-value">${platformActivity.systemHealth.responseTime}</div>
                                    <div class="stat-label">Avg Response Time</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-value">${platformActivity.engagement.dailyActive}</div>
                                    <div class="stat-label">Daily Active Users</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-value">${platformActivity.engagement.growthRate}%</div>
                                    <div class="stat-label">Growth Rate</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p>This report was automatically generated by WasteZero Admin Dashboard</p>
                            <p>For support, contact: admin@wastezero.com</p>
                        </div>
                    </body>
                </html>
            `
            
            // Write content to the new window
            printWindow.document.write(reportContent)
            printWindow.document.close()
            
            // Wait for content to load, then trigger print
            setTimeout(() => {
                printWindow.focus()
                printWindow.print()
                
                // Optional: Close the window after printing
                setTimeout(() => {
                    printWindow.close()
                }, 100)
            }, 500)
            
            toast.success('📄 Report generated successfully! Print dialog opened.')
            
        } catch (err) {
            console.error('Error exporting report:', err)
            toast.error('Failed to generate report. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    // Fetch users with filters and pagination
    const fetchUsers = async (page = 1) => {
        try {
            setLoading(true)
            const params = {
                page,
                limit: 20,
                ...userFilters
            }
            
            const response = await adminAPI.getAllUsers(params)
            if (response.success) {
                setUsers(response.data.users)
                setUsersPagination(response.data.pagination)
            }
        } catch (err) {
            console.error('Error fetching users:', err)
            setError('Failed to fetch users')
        } finally {
            setLoading(false)
        }
    }

    // Handle user block/unblock
    const handleToggleUserBlock = async (userId, isBlocking) => {
        try {
            console.log('handleToggleUserBlock called:', { userId, isBlocking, currentUser: selectedUser })
            
            if (isBlocking && !blockReason.trim()) {
                toast.error('Please provide a reason for blocking this user')
                return
            }

            // For unblocking, we don't need a reason, so pass empty string
            const reasonToSend = isBlocking ? blockReason : ''
            console.log('Sending request to API:', { userId, reasonToSend, isBlocking })
            
            const response = await adminAPI.toggleUserBlock(userId, reasonToSend)
            console.log('API response:', response)
            
            if (response.success) {
                // Update user in the list
                setUsers(prev => prev.map(user => 
                    user._id === userId 
                        ? { ...user, isBlocked: response.data.isBlocked, blockReason: response.data.blockReason }
                        : user
                ))
                
                // Refresh only the users list to update the UI - avoid dashboard refresh to prevent conflicts
                await fetchUsers(usersPagination.currentPage)
                
                setShowBlockModal(false)
                setBlockReason('')
                setSelectedUser(null)
                
                toast.success(response.message, {
                    icon: isBlocking ? '🚫' : '✅'
                })
            } else {
                console.error('API response indicates failure:', response)
                toast.error(response.message || 'Failed to update user status')
            }
        } catch (err) {
            console.error('Error toggling user block:', err)
            console.error('Error details:', err.response?.data)
            
            // Check if it's a blocked user error
            if (err.response?.data?.isBlocked) {
                toast.error('This user is already blocked!')
            } else if (err.response?.data?.message) {
                toast.error(err.response.data.message)
            } else {
                toast.error('Failed to update user status. Please try again.')
            }
        }
    }

    // Navigate to messages page to chat with user
    const handleStartChat = async (userId) => {
        // Navigate to messages page - the MessagePage component will handle the chat functionality
        navigate('/admin/message')
    }

    // Handle user filter changes
    const handleUserFilterChange = (field, value) => {
        setUserFilters(prev => ({
            ...prev,
            [field]: value
        }))
    }

    // Fetch waste collection data based on period
    const fetchWasteCollectionData = async (period = 'month') => {
        try {
            console.log(`Fetching waste collection data for period: ${period}`)
            const response = await legacyAdminAPI.getWasteCollectionReport(period.toLowerCase())
            
            if (response.success && response.data) {
                console.log('Waste collection data received:', response.data)
                setWasteCollectionData(response.data)
            } else {
                console.error('Invalid waste collection data response:', response)
                setWasteCollectionData([])
            }
        } catch (error) {
            console.error('Error fetching waste collection data:', error)
            setWasteCollectionData([])
        }
    }

    // Handle period change for waste collection chart
    const handlePeriodChange = async (period) => {
        setSelectedPeriod(period)
        setLoading(true)
        await fetchWasteCollectionData(period)
        setLoading(false)
    }

    useEffect(() => {
        fetchDashboardData()
        fetchUsers(1)
    }, [])

    // Refetch users when filters change
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchUsers(1)
        }, 500)
        return () => clearTimeout(timeoutId)
    }, [userFilters])

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={fetchDashboardData}
                        className="bg-[#344e41] text-white px-4 py-2 rounded-lg hover:bg-[#588157] transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    const location = useLocation();
//   const [activeTab, setActiveTab] = useState('dashboard');

  // sync activeTab with URL (so direct URL /admin/users highlights tab)
  useEffect(() => {
    const parts = location.pathname.split('/').filter(Boolean); // ["admin","users"]
    if (parts[1]) {
      setActiveTab(parts[1]);
    } else {
      setActiveTab('dashboard'); // default
    }
  }, [location.pathname]);

  const tabs = [
    { id: 'dashboard', label: 'Overview', icon: BarChart3, to: '/admin' },
    { id: 'users', label: 'Users', icon: Users, to: '/admin/users' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, to: '/admin/analytics' },
  ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Clean Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    WasteZero Admin
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Environmental Impact Management</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            {/* <button onClick={toggleTheme} className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                {theme === 'light' ? <Moon className="w-5 h-5 text-gray-600" /> : <Sun className="w-5 h-5 text-yellow-400" />}
                            </button> */}
                            <button
                                onClick={fetchDashboardData}
                                disabled={loading}
                                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline">Refresh</span>
                            </button>
                            <button
                                onClick={handleExportReport}
                                disabled={loading}
                                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center space-x-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <BarChart3 className="w-4 h-4" />
                                <span className="hidden sm:inline">Export</span>
                            </button>
                            <button className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Clean Navigation Tabs
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 md:top-14 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-1 py-3">
                        {[
                            { id: 'dashboard', label: 'Overview', icon: BarChart3, hideOnMobile: false },
                            { id: 'users', label: 'Users', icon: Users, hideOnMobile: false },
                            { id: 'analytics', label: 'Analytics', icon: TrendingUp, hideOnMobile: false }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors flex-shrink-0 focus:outline-none ${
                                    activeTab === tab.id
                                        ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-700'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div> */}

<div>
      {/* Clean Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 md:top-14 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 py-3">
            {tabs.map(tab => (
              <NavLink
                key={tab.id}
                to={tab.to}
                onClick={() => setActiveTab(tab.id)}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors flex-shrink-0 focus:outline-none ${
                    isActive || activeTab === tab.id
                      ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-700'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`
                }
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* This is where nested routes render (UsersPage, Analytics, etc.) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </div>
    </div>
  );



            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Dashboard Tab Content */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-8">
                        {/* Enhanced Header Section */}
                        <div className="bg-gradient-to-r from-emerald-50 via-blue-50 to-purple-50 dark:from-gray-800 dark:via-gray-800/50 dark:to-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Platform Overview</h1>
                                    <p className="text-gray-600 dark:text-gray-400 mt-2">Real-time insights and analytics for WasteZero platform</p>
                                    <div className="flex items-center mt-3 text-sm text-gray-500 dark:text-gray-400">
                                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                                        Last updated: {new Date().toLocaleTimeString()}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm text-gray-700 dark:text-gray-200"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        <span>Refresh</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('analytics')}
                                        className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                                    >
                                        <BarChart3 className="w-4 h-4" />
                                        <span>Full Analytics</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {stats.map((stat, index) => {
                                const IconComponent = stat.icon
                                const colors = [
                                    { bg: 'bg-gradient-to-br from-blue-500 to-blue-600', iconBg: 'bg-blue-100 dark:bg-blue-900/50', iconColor: 'text-blue-600 dark:text-blue-300', accent: 'text-blue-600 dark:text-blue-400' },
                                    { bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600', iconBg: 'bg-emerald-100 dark:bg-emerald-900/50', iconColor: 'text-emerald-600 dark:text-emerald-300', accent: 'text-emerald-600 dark:text-emerald-400' },
                                    { bg: 'bg-gradient-to-br from-orange-500 to-orange-600', iconBg: 'bg-orange-100 dark:bg-orange-900/50', iconColor: 'text-orange-600 dark:text-orange-300', accent: 'text-orange-600 dark:text-orange-400' },
                                    { bg: 'bg-gradient-to-br from-purple-500 to-purple-600', iconBg: 'bg-purple-100 dark:bg-purple-900/50', iconColor: 'text-purple-600 dark:text-purple-300', accent: 'text-purple-600 dark:text-purple-400' }
                                ]
                                const colorScheme = colors[index % colors.length]
                                
                                return (
                                    <div 
                                        key={index} 
                                        className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 transform hover:-translate-y-1"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`w-14 h-14 ${colorScheme.iconBg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                                <IconComponent className={`w-7 h-7 ${colorScheme.iconColor}`} />
                                            </div>
                                            <div className="text-right">
                                                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorScheme.accent} bg-gray-50 dark:bg-gray-700/50`}>
                                                    {stat.change}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Enhanced Platform Activity Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                                            <TrendingUp className="w-6 h-6 mr-3 text-emerald-600 dark:text-emerald-400" />
                                            Platform Insights
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Real-time monitoring and engagement metrics</p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() => setActiveTab('users')}
                                            className="bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-all duration-200 flex items-center space-x-2 text-sm font-medium shadow-lg hover:shadow-xl"
                                        >
                                            <Users className="w-4 h-4" />
                                            <span className="hidden sm:inline">Manage Users</span>
                                            <span className="sm:hidden">Users</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {/* Enhanced User Distribution Card */}
                                    <div className="group border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:shadow-xl dark:hover:border-gray-600 transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/20">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                                                    <Users className="w-6 h-6 text-white" />
                                                </div>
                                                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">User Distribution</h3>
                                            </div>
                                            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center p-3 bg-white/60 dark:bg-gray-700/50 rounded-xl">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">NGOs</span>
                                                </div>
                                                <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">{platformActivity.userDistribution.ngos.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center p-3 bg-white/60 dark:bg-gray-700/50 rounded-xl">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Volunteers</span>
                                                </div>
                                                <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">{platformActivity.userDistribution.volunteers.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-900/50 rounded-xl border border-emerald-200 dark:border-emerald-700">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                                                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Total Active</span>
                                                </div>
                                                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xl">{platformActivity.userDistribution.total.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Enhanced Growth Metrics Card */}
                                    <div className="group border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:shadow-xl dark:hover:border-gray-600 transition-all duration-300 bg-gradient-to-br from-white to-emerald-50/30 dark:from-gray-800 dark:to-emerald-900/20">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                                                    <TrendingUp className="w-6 h-6 text-white" />
                                                </div>
                                                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Platform Growth</h3>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center p-3 bg-white/60 dark:bg-gray-700/50 rounded-xl">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Users</span>
                                                <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">{platformActivity.engagement.dailyActive.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/50 rounded-xl border border-blue-200 dark:border-blue-700">
                                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">New Today</span>
                                                <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">{platformActivity.engagement.newToday}</span>
                                            </div>
                                            <div className="flex justify-between items-center p-3 bg-white/60 dark:bg-gray-700/50 rounded-xl">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Existing Users</span>
                                                <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">{(platformActivity.engagement.dailyActive - platformActivity.engagement.newToday).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-900/50 rounded-xl border border-emerald-200 dark:border-emerald-700">
                                                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Growth Rate</span>
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xl">+{platformActivity.engagement.growthRate}%</span>
                                                    <div className="text-emerald-500">📈</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Enhanced System Performance Card */}
                                    <div className="group border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:shadow-xl dark:hover:border-gray-600 transition-all duration-300 bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-800 dark:to-purple-900/20">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                                    <Settings className="w-6 h-6 text-white" />
                                                </div>
                                                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">System Status</h3>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                                                <span className="text-xs font-medium text-green-600 dark:text-green-400">ONLINE</span>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/50 rounded-xl border border-green-200 dark:border-green-700">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                    <span className="text-sm font-medium text-green-700 dark:text-green-300">Uptime</span>
                                                </div>
                                                <span className="font-bold text-green-600 dark:text-green-400 text-lg">{platformActivity.systemHealth.uptime}</span>
                                            </div>
                                            <div className="flex justify-between items-center p-3 bg-white/60 dark:bg-gray-700/50 rounded-xl">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Response</span>
                                                </div>
                                                <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">{platformActivity.systemHealth.responseTime}</span>
                                            </div>
                                            <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-900/50 rounded-xl border border-emerald-200 dark:border-emerald-700">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                                                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Status</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">{platformActivity.systemHealth.status}</span>
                                                    <div className="text-emerald-500">✅</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Enhanced Recent Activities - Takes 2/3 of the space */}
                            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                                <Clock className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Recent Activities</h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Live platform activity feed</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                            <span className="text-xs font-medium text-green-600 dark:text-green-400">LIVE</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {recentActivities.length > 0 ? recentActivities.map((activity, index) => (
                                        <div key={activity.id || index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                    activity.userRole === 'ngo' ? 'bg-green-100 dark:bg-green-900/50' : 
                                                    activity.userRole === 'volunteer' ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-gray-100 dark:bg-gray-600'
                                                }`}>
                                                    <span className={`font-semibold text-sm ${
                                                        activity.userRole === 'ngo' ? 'text-green-600 dark:text-green-300' : 
                                                        activity.userRole === 'volunteer' ? 'text-blue-600 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300'
                                                    }`}>
                                                        {activity.user.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{activity.description}</p>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                                            activity.type === 'Event Created' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                                                            activity.type === 'Application' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                                                            activity.type === 'User Registration' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' :
                                                            'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-200'
                                                        }`}>
                                                            {activity.type}
                                                        </span>
                                                        {activity.status && (
                                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                                activity.status === 'accepted' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                                                                activity.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' :
                                                                activity.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                                                                activity.status === 'active' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                                                                'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-200'
                                                            }`}>
                                                                {activity.status}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(activity.date).toLocaleDateString()}
                                                </span>
                                                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                    {new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            <p>No recent activities yet</p>
                                            <p className="text-sm mt-1">Activities will appear as users interact with the platform</p>
                                        </div>
                                    )}
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Quick Actions & Admin Tools */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                                            <Navigation className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Admin Tools</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Quick access to key functions</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {[
                                            { 
                                                icon: Users, 
                                                label: 'Manage Users', 
                                                desc: 'View, edit and manage user accounts',
                                                color: 'bg-gradient-to-r from-blue-500 to-blue-600',
                                                hoverColor: 'hover:from-blue-600 hover:to-blue-700',
                                                action: () => setActiveTab('users')
                                            },
                                            { 
                                                icon: BarChart3, 
                                                label: 'Analytics Dashboard', 
                                                desc: 'Detailed reports and insights',
                                                color: 'bg-gradient-to-r from-purple-500 to-purple-600',
                                                hoverColor: 'hover:from-purple-600 hover:to-purple-700',
                                                action: () => setActiveTab('analytics')
                                            },
                                            { 
                                                icon: MessageSquare, 
                                                label: 'Message Center', 
                                                desc: 'Communicate with users',
                                                color: 'bg-gradient-to-r from-orange-500 to-orange-600',
                                                hoverColor: 'hover:from-orange-600 hover:to-orange-700',
                                                action: () => navigate('/admin/message')
                                            },
                                            { 
                                                icon: Settings, 
                                                label: 'Platform Settings', 
                                                desc: 'Configure system preferences',
                                                color: 'bg-gradient-to-r from-gray-500 to-gray-600',
                                                hoverColor: 'hover:from-gray-600 hover:to-gray-700',
                                                action: () => alert('Settings panel coming soon!')
                                            }
                                        ].map((action, index) => (
                                            <button 
                                                key={index}
                                                onClick={action.action}
                                                className={`w-full p-4 ${action.color} ${action.hoverColor} text-white rounded-xl transition-all duration-300 flex items-center space-x-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-105 shadow-lg hover:shadow-xl group`}
                                            >
                                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                                    <action.icon className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <div className="font-bold text-white">{action.label}</div>
                                                    <div className="text-white/80 text-sm">{action.desc}</div>
                                                </div>
                                                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:translate-x-1 transition-transform">
                                                    <span className="text-white text-sm">→</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    
                                    {/* Additional System Info */}
                                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="text-gray-600 dark:text-gray-400">
                                                <span className="font-medium">System Version:</span> v2.1.0
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                                <span className="text-green-600 dark:text-green-400 font-medium">All Systems Operational</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Waste Collection Trends Chart */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Waste Collection Trends</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Track waste collection performance over time</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        {['Week', 'Month', 'Year'].map((period) => (
                                            <button 
                                                key={period}
                                                onClick={() => handlePeriodChange(period)}
                                                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                                                    selectedPeriod === period 
                                                        ? 'bg-emerald-600 text-white' 
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                }`}
                                            >
                                                {period}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                {wasteCollectionData.length > 0 ? (
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={wasteCollectionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#f0f0f0'} />
                                                <XAxis 
                                                    dataKey="date" 
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 12, fill: theme === 'dark' ? '#9ca3af' : '#666' }}
                                                />
                                                <YAxis 
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 12, fill: theme === 'dark' ? '#9ca3af' : '#666' }}
                                                />
                                                <Tooltip 
                                                    contentStyle={{
                                                        backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
                                                        border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                                                        borderRadius: '8px',
                                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                                    }}
                                                    labelStyle={{ fontWeight: 'bold', color: theme === 'dark' ? '#f3f4f6' : '#374151' }}
                                                    itemStyle={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="collected"
                                                    stackId="1"
                                                    stroke="#10b981"
                                                    fill="#10b981"
                                                    fillOpacity={0.6}
                                                    name="Total Collected (kg)"
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="recycled"
                                                    stackId="1"
                                                    stroke="#3b82f6"
                                                    fill="#3b82f6"
                                                    fillOpacity={0.6}
                                                    name="Recycled (kg)"
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="organic"
                                                    stackId="1"
                                                    stroke="#f59e0b"
                                                    fill="#f59e0b"
                                                    fillOpacity={0.6}
                                                    name="Organic Waste (kg)"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                                        <div className="text-center">
                                            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center mx-auto mb-3">
                                                <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-300 font-medium">Loading waste collection data...</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Please wait while we fetch the latest trends</p>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Chart Legend */}
                                {wasteCollectionData.length > 0 && (
                                    <div className="flex flex-wrap items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Total Collected</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Recycled</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Organic Waste</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* User Management Tab Content */}
                {activeTab === 'users' && (
                    <div className="space-y-8">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    User Management
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Monitor and manage platform users, NGOs and volunteers</p>
                            </div>
                            <div className="flex space-x-3">
                                <button 
                                    onClick={() => fetchUsers(1)}
                                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    <span className="hidden sm:inline">Refresh</span>
                                </button>
                            </div>
                        </div>

                        {/* User Filters */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Users</label>
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        value={userFilters.search}
                                        onChange={(e) => handleUserFilterChange('search', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm dark:placeholder-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role Filter</label>
                                    <select
                                        value={userFilters.role}
                                        onChange={(e) => handleUserFilterChange('role', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                                    >
                                        <option value="">All Roles</option>
                                        <option value="volunteer">Volunteers</option>
                                        <option value="ngo">NGOs</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status Filter</label>
                                    <select
                                        value={userFilters.status}
                                        onChange={(e) => handleUserFilterChange('status', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                                    >
                                        <option value="">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="blocked">Blocked</option>
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={() => fetchUsers(1)}
                                        className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2 text-sm"
                                    >
                                        <Eye className="w-4 h-4" />
                                        <span>Apply Filters</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* User Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { 
                                    icon: Users, 
                                    label: 'Total Users', 
                                    value: usersPagination.totalUsers || 0, 
                                    color: 'bg-blue-100 dark:bg-blue-900/50',
                                    iconColor: 'text-blue-600 dark:text-blue-300'
                                },
                                { 
                                    icon: Recycle, 
                                    label: 'NGOs', 
                                    value: users.filter(u => u.role === 'ngo').length, 
                                    color: 'bg-green-100 dark:bg-green-900/50',
                                    iconColor: 'text-green-600 dark:text-green-300'
                                },
                                { 
                                    icon: UserCheck, 
                                    label: 'Volunteers', 
                                    value: users.filter(u => u.role === 'volunteer').length, 
                                    color: 'bg-orange-100 dark:bg-orange-900/50',
                                    iconColor: 'text-orange-600 dark:text-orange-300'
                                },
                                { 
                                    icon: X, 
                                    label: 'Blocked', 
                                    value: users.filter(u => u.isBlocked).length, 
                                    color: 'bg-red-100 dark:bg-red-900/50',
                                    iconColor: 'text-red-600 dark:text-red-300'
                                }
                            ].map((stat, index) => (
                                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stat.value}</p>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                                                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Users Table */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Platform Users</h3>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {usersPagination.totalUsers} users found
                                    </div>
                                </div>
                            </div>
                            
                            {/* Mobile User Cards */}
                            <div className="lg:hidden divide-y divide-gray-200 dark:divide-gray-700">
                                {users.map((user) => (
                                    <div key={user._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center">
                                                    <span className="text-emerald-600 dark:text-emerald-300 font-semibold text-sm">
                                                        {user.name.split(' ').map(n => n[0]).join('')}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user.name}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                                                </div>
                                            </div>
                                            <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full border ${
                                                user.isBlocked ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700' :
                                                'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700'
                                            }`}>
                                                {user.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-2 mb-3">
                                            <div className="flex items-center space-x-2 text-sm">
                                                <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                <span className="text-gray-900 dark:text-gray-200 capitalize">{user.role}</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-sm">
                                                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                <span className="text-gray-900 dark:text-gray-200 truncate">{user.location}</span>
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                Joined: {new Date(user.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        
                                        <div className="flex space-x-2">
                                            {(currentUser._id !== user._id && currentUser.id !== user._id) && (
                                                <button 
                                                    onClick={() => handleStartChat(user._id)}
                                                    className="flex-1 bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-emerald-700 transition-colors"
                                                >
                                                    Chat
                                                </button>
                                            )}
                                            {(currentUser._id !== user._id && currentUser.id !== user._id) ? (
                                                <button 
                                                    onClick={() => {
                                                        setSelectedUser(user)
                                                        setShowBlockModal(true)
                                                    }}
                                                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                                        user.isBlocked 
                                                            ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-800'
                                                            : 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-800'
                                                    }`}
                                                >
                                                    {user.isBlocked ? 'Unblock' : 'Block'}
                                                </button>
                                            ) : (
                                                <div className="flex-1 px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 rounded-lg italic font-medium text-center">
                                                    You (Admin)
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Desktop Users Table */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-700">
                                        <tr>
                                            {['User', 'Role', 'Location', 'Joined', 'Status', 'Actions'].map(header => (
                                                <th key={header} className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {users.map((user) => (
                                            <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center">
                                                            <span className="text-emerald-600 dark:text-emerald-300 font-semibold text-sm">
                                                                {user.name.split(' ').map(n => n[0]).join('')}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user.name}</div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                                        user.role === 'ngo' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                                                        user.role === 'volunteer' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                                                        'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-200'
                                                    }`}>
                                                        {user.role.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                        <span className="text-sm text-gray-900 dark:text-gray-200 max-w-xs truncate">{user.location}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200">
                                                    {new Date(user.createdAt).toLocaleDateString('en-US', { 
                                                        month: 'short', 
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full border ${
                                                        user.isBlocked ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700' :
                                                        'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700'
                                                    }`}>
                                                        {user.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                                                    </span>
                                                    {user.isBlocked && user.blockReason && (
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{user.blockReason}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        {(currentUser._id !== user._id && currentUser.id !== user._id) && (
                                                            <button 
                                                                onClick={() => handleStartChat(user._id)}
                                                                className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                                title="Chat with user"
                                                            >
                                                                <MessageSquare className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {(currentUser._id !== user._id && currentUser.id !== user._id) ? (
                                                            <button 
                                                                onClick={() => {
                                                                    setSelectedUser(user)
                                                                    setShowBlockModal(true)
                                                                }}
                                                                className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                                                                    user.isBlocked 
                                                                        ? 'text-green-600 dark:text-green-400 hover:bg-green-600 hover:text-white dark:hover:bg-green-500 focus:ring-green-500'
                                                                        : 'text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-500 focus:ring-red-500'
                                                                }`}
                                                                title={user.isBlocked ? 'Unblock user' : 'Block user'}
                                                            >
                                                                {user.isBlocked ? <UserCheck className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                                            </button>
                                                        ) : (
                                                            <div className="p-2 bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700 rounded-lg text-sm italic font-medium" title="You cannot block yourself">
                                                                You
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Pagination */}
                            {usersPagination.totalPages > 1 && (
                                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            Showing {users.length} of {usersPagination.totalUsers} users
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => fetchUsers(usersPagination.currentPage - 1)}
                                                disabled={!usersPagination.hasPrev}
                                                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200"
                                            >
                                                Previous
                                            </button>
                                            <span className="px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg">
                                                {usersPagination.currentPage} of {usersPagination.totalPages}
                                            </span>
                                            <button
                                                onClick={() => fetchUsers(usersPagination.currentPage + 1)}
                                                disabled={!usersPagination.hasNext}
                                                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Analytics Tab Content */}
                {activeTab === 'analytics' && (
                    <div className="space-y-8">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    Platform Analytics
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Comprehensive insights into platform performance and user behavior</p>
                            </div>
                            <button 
                                onClick={fetchDashboardData}
                                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span className="hidden sm:inline">Refresh Data</span>
                            </button>
                        </div>
                        <WasteZeroAnalytics userRole="admin" />
                    </div>
                )}
            </div>

            {/* Block/Unblock User Modal */}
            {showBlockModal && selectedUser && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-6 border border-gray-200/50 dark:border-gray-700">
                        <div className="text-center mb-6">
                            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                                selectedUser.isBlocked ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'
                            }`}>
                                {selectedUser.isBlocked ? (
                                    <UserCheck className="w-8 h-8 text-green-600 dark:text-green-300" />
                                ) : (
                                    <X className="w-8 h-8 text-red-600 dark:text-red-300" />
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                {selectedUser.isBlocked ? 'Unblock User' : 'Block User'}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                {selectedUser.isBlocked 
                                    ? `Are you sure you want to unblock ${selectedUser.name}?`
                                    : `Are you sure you want to block ${selectedUser.name}?`
                                }
                            </p>
                        </div>

                        {!selectedUser.isBlocked && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Reason for blocking *
                                </label>
                                <textarea
                                    value={blockReason}
                                    onChange={(e) => setBlockReason(e.target.value)}
                                    placeholder="Please provide a reason for blocking this user..."
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none dark:placeholder-gray-400"
                                    rows={3}
                                    required
                                />
                            </div>
                        )}

                        <div className="flex space-x-3">
                            <button
                                onClick={() => {
                                    setShowBlockModal(false)
                                    setSelectedUser(null)
                                    setBlockReason('')
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleToggleUserBlock(selectedUser._id, !selectedUser.isBlocked)}
                                className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors ${
                                    selectedUser.isBlocked
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                }`}
                            >
                                {selectedUser.isBlocked ? 'Unblock User' : 'Block User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminDashboard
