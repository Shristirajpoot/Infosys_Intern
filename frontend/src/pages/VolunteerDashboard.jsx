import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Activity, CheckCircle, Clock, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';

import StatCard from '../components/StatCard';
import MatchedOpportunities from '../components/MatchedOpportunities';
import UpcomingPickups from '../components/UpcomingPickups';
import RecentNotifications from '../components/RecentNotifications';
import VolunteerPreferences from '../components/VolunteerPreferences';
import { volunteerAPI } from '../services/api';

export default function VolunteerDashboard() {
    const navigate = useNavigate();
    const location = useLocation();

    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({ totalApplications: 0, acceptedApplications: 0, totalHoursVolunteered: 0, upcomingEvents: 0 });
    const [opportunities, setOpportunities] = useState([]);
    const [applications, setApplications] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notificationsLoading, setNotificationsLoading] = useState(false);
    const [applyingTo, setApplyingTo] = useState(null);
    const [user, setUser] = useState(null);

    const highlightIdRef = useRef(null);

    useEffect(() => {
        try {
            const params = new URLSearchParams(location.search);
            const tab = params.get('tab');
            const id = params.get('id');
            if (tab) setActiveTab(tab);
            if (id) highlightIdRef.current = id;
        } catch (e) {}

        loadUser();
        loadDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadUser = async () => {
        try {
            const resp = await volunteerAPI.getProfile();
            setUser(resp?.data || resp || null);
        } catch (err) {}
    };

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [statsResp, opsResp, appsResp, notifsResp] = await Promise.all([
                volunteerAPI.getDashboardStats(),
                volunteerAPI.getAllOpportunities({ limit: 60, includeMatched: 'true' }),
                volunteerAPI.getMyApplications(),
                volunteerAPI.getNotifications().catch(() => ({ data: [] }))
            ]);

            const statsData = statsResp?.data || statsResp || {};
            const opsData = opsResp?.data || opsResp || [];
            const appsData = appsResp?.data || appsResp || [];
            const notifsData = notifsResp?.data || notifsResp || [];

            const acceptedApplications = (appsData || []).filter(a => a.status === 'accepted');
            const upcoming = acceptedApplications.map(a => ({ ...(a.opportunityId || a.opportunity || {}), applicationId: a._id }));

            setStats({
                totalApplications: statsData.totalApplications || 0,
                acceptedApplications: statsData.acceptedApplications || 0,
                totalHoursVolunteered: statsData.totalHoursVolunteered || 0,
                upcomingEvents: upcoming.length
            });

            setOpportunities(opsData);
            setApplications(appsData);
            setUpcomingEvents(upcoming);
            setNotifications(notifsData);
        } catch (err) {
            console.error('loadDashboardData error', err);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const refreshNotifications = async () => {
        setNotificationsLoading(true);
        try {
            const r = await volunteerAPI.getNotifications();
            setNotifications(r?.data || r || []);
        } catch (err) {
            console.error(err);
        } finally {
            setNotificationsLoading(false);
        }
    };

    const handleApply = async (opportunityId) => {
        try {
            setApplyingTo(opportunityId);
            await volunteerAPI.applyForOpportunity(opportunityId);
            toast.success('Applied successfully');
            await loadDashboardData();
        } catch (err) {
            toast.error('Apply failed');
        } finally {
            setApplyingTo(null);
        }
    };

    const handleWithdraw = async (applicationId) => {
        try {
            await volunteerAPI.withdrawApplication(applicationId);
            toast.success('Withdrawn');
            await loadDashboardData();
        } catch (err) {
            toast.error('Failed to withdraw');
        }
    };

    const filteredOpportunities = opportunities || [];

    const renderDashboardTab = () => (
        <div className="space-y-8 p-6 lg:p-8 bg-gray-50 min-h-screen">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard stat={{ icon: Activity, label: 'Total Applications', value: stats.totalApplications, color: 'blue' }} />
                <StatCard stat={{ icon: CheckCircle, label: 'Accepted', value: stats.acceptedApplications, color: 'green' }} />
                <StatCard stat={{ icon: Clock, label: 'Hours Volunteered', value: stats.totalHoursVolunteered, color: 'purple' }} />
                <StatCard stat={{ icon: Calendar, label: 'Upcoming Events', value: stats.upcomingEvents, color: 'orange' }} />
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border">
                <h2 className="text-2xl font-bold mb-4">Matched Opportunities</h2>
                <MatchedOpportunities onApply={handleApply} loading={loading} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2" />
                <div className="space-y-6">
                    <UpcomingPickups upcomingEvents={upcomingEvents} loading={loading} onViewAllEvents={() => setActiveTab('applications')} />
                    <RecentNotifications notifications={notifications} loading={notificationsLoading || loading} onViewAllNotifications={() => navigate('/volunteer/notifications')} />
                </div>
            </div>
        </div>
    );

    const renderOpportunitiesTab = () => (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="bg-white rounded-xl p-6 shadow-md border mb-6">
                <h3 className="text-xl font-bold mb-2">Opportunities</h3>
                <p className="text-sm text-gray-600">Browse all available opportunities.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOpportunities.map(op => (
                    <div key={op._id} className="bg-white rounded-xl shadow p-4">
                        <h4 className="font-semibold">{op.title}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">{op.description}</p>
                        <div className="mt-3 flex items-center justify-between">
                            <button onClick={() => handleApply(op._id)} className="px-4 py-2 bg-green-600 text-white rounded-lg">Apply</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderApplicationsTab = () => (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="text-xl font-bold mb-4">My Applications</h3>
                {applications.length === 0 ? (
                    <div className="text-center py-12">No applications yet.</div>
                ) : (
                    <div className="space-y-4">
                        {applications.map(app => (
                            <div key={app._id} className="border rounded p-4 bg-white">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-semibold">{app.opportunityId?.title || app.opportunity?.title}</h4>
                                        <p className="text-sm text-gray-600">{app.opportunityId?.location || app.opportunity?.location}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="px-3 py-1 rounded-full bg-gray-100 text-sm">{app.status}</div>
                                        {app.status === 'pending' && <button onClick={() => handleWithdraw(app._id)} className="mt-2 text-sm text-red-600">Withdraw</button>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            <div className="flex-1 max-w-7xl mx-auto w-full">
                <div className="rounded-xl overflow-hidden shadow mb-6">
                    <div className="bg-gradient-to-r from-emerald-400 via-green-500 to-cyan-500 text-white p-8 md:p-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-extrabold">Volunteer Dashboard</h1>
                                <p className="mt-2 text-lg text-white/90">Make a difference in waste management — your actions matter.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={refreshNotifications} className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full"> <Bell className="w-4 h-4"/> Notifications</button>
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">{(user?.name || 'U').charAt(0)}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="-mt-7 px-4">
                    <div className="bg-white rounded-xl shadow-md p-2 max-w-full overflow-auto">
                        <div className="flex items-center space-x-2">
                            <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-lg text-sm font-semibold ${activeTab === 'dashboard' ? 'bg-green-600 text-white' : 'text-gray-600'}`}>Dashboard</button>
                            <button onClick={() => setActiveTab('opportunities')} className={`px-4 py-2 rounded-lg text-sm font-semibold ${activeTab === 'opportunities' ? 'bg-green-600 text-white' : 'text-gray-600'}`}>Opportunities</button>
                            <button onClick={() => setActiveTab('applications')} className={`px-4 py-2 rounded-lg text-sm font-semibold ${activeTab === 'applications' ? 'bg-green-600 text-white' : 'text-gray-600'}`}>My Applications</button>
                            <button onClick={() => setActiveTab('preferences')} className={`px-4 py-2 rounded-lg text-sm font-semibold ${activeTab === 'preferences' ? 'bg-green-600 text-white' : 'text-gray-600'}`}>Preferences</button>
                        </div>
                    </div>
                </div>

                <main>
                    {activeTab === 'dashboard' && renderDashboardTab()}
                    {activeTab === 'opportunities' && renderOpportunitiesTab()}
                    {activeTab === 'applications' && renderApplicationsTab()}
                    {activeTab === 'preferences' && <VolunteerPreferences user={user} onUpdate={() => { loadUser(); loadDashboardData(); }} />}
                </main>
            </div>
        </div>
    );
}
