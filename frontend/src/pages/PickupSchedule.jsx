import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Truck, Plus, Edit, Trash2, Package, User, Phone, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { pickupAPI } from '../services/api';
import { useUser } from '../contexts/UserContext';

const PickupSchedule = () => {
  const { user } = useUser();
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0
  });
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [availableAgents, setAvailableAgents] = useState([]);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [newPickup, setNewPickup] = useState({
    date: '',
    time: '',
    location: { address: '' },
    wasteTypes: [],
    notes: '',
    estimatedQuantity: 0,
    priority: 'medium',
    contactInfo: {
      phone: '',
      contactPerson: ''
    }
  });

  const wasteTypes = [
    { id: 'plastic', label: 'Plastic', color: 'bg-blue-500' },
    { id: 'organic', label: 'Organic', color: 'bg-green-500' },
    { id: 'paper', label: 'Paper', color: 'bg-yellow-500' },
    { id: 'glass', label: 'Glass', color: 'bg-purple-500' },
    { id: 'metal', label: 'Metal', color: 'bg-gray-500' },
    { id: 'e-waste', label: 'E-Waste', color: 'bg-red-500' }
  ];

  useEffect(() => {
    loadPickups();
    loadStats();
    loadAgents();
  }, []);

  const loadPickups = async () => {
    try {
      setLoading(true);
      const response = await pickupAPI.getMyPickups();
      if (response.success) {
        setPickups(response.data.docs || response.data);
      } else {
        throw new Error(response.message || 'Failed to load pickups');
      }
    } catch (error) {
      console.error('Error loading pickups:', error);
      toast.error(error.message || 'Failed to load pickups');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await pickupAPI.getPickupStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      // Don't show error toast for stats as it's not critical
    }
  };

  const loadAgents = async () => {
    if (user?.role === 'ngo') {
      try {
        const response = await pickupAPI.getAvailableAgents();
        if (response.success) {
          setAvailableAgents(response.data);
        }
      } catch (error) {
        console.error('Error loading agents:', error);
      }
    }
  };

  const handleSchedulePickup = async (e) => {
    e.preventDefault();
    
    if (!newPickup.date || !newPickup.time || !newPickup.location.address || newPickup.wasteTypes.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await pickupAPI.createPickup(newPickup);
      
      if (response.success) {
        toast.success('Pickup scheduled successfully!');
        setShowScheduleModal(false);
        setNewPickup({
          date: '',
          time: '',
          location: { address: '' },
          wasteTypes: [],
          notes: '',
          estimatedQuantity: 0,
          priority: 'medium',
          contactInfo: {
            phone: '',
            contactPerson: ''
          }
        });
        
        // Reload pickups and stats
        await Promise.all([loadPickups(), loadStats()]);
      } else {
        throw new Error(response.message || 'Failed to schedule pickup');
      }
    } catch (error) {
      console.error('Error scheduling pickup:', error);
      toast.error(error.message || 'Failed to schedule pickup');
    } finally {
      setLoading(false);
    }
  };

  const handleWasteTypeToggle = (wasteTypeId) => {
    setNewPickup(prev => ({
      ...prev,
      wasteTypes: prev.wasteTypes.includes(wasteTypeId)
        ? prev.wasteTypes.filter(id => id !== wasteTypeId)
        : [...prev.wasteTypes, wasteTypeId]
    }));
  };

  const handleCancelPickup = async (pickupId) => {
    if (window.confirm('Are you sure you want to cancel this pickup?')) {
      try {
        setLoading(true);
        const response = await pickupAPI.cancelPickup(pickupId, 'Cancelled by user');
        
        if (response.success) {
          toast.success('Pickup cancelled successfully!');
          await Promise.all([loadPickups(), loadStats()]);
        } else {
          throw new Error(response.message || 'Failed to cancel pickup');
        }
      } catch (error) {
        console.error('Error cancelling pickup:', error);
        toast.error(error.message || 'Failed to cancel pickup');
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePickupClick = (pickup) => {
    console.log('Clicked pickup:', pickup);
    setSelectedPickup(pickup);
    setShowDetailsModal(true);
  };

  const handleAcceptPickup = async (pickupId) => {
    if (!user || user.role !== 'ngo') {
      toast.error('Only NGOs can accept pickup requests');
      return;
    }

    try {
      setLoading(true);
      const response = await pickupAPI.acceptPickup(pickupId);
      
      if (response.success) {
        toast.success('Pickup request accepted successfully!');
        await Promise.all([loadPickups(), loadStats()]);
        setShowDetailsModal(false);
      } else {
        throw new Error(response.message || 'Failed to accept pickup');
      }
    } catch (error) {
      console.error('Error accepting pickup:', error);
      toast.error(error.message || 'Failed to accept pickup');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectPickup = async (pickupId) => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      setLoading(true);
      const response = await pickupAPI.cancelPickup(pickupId, reason);
      
      if (response.success) {
        toast.success('Pickup request rejected');
        await Promise.all([loadPickups(), loadStats()]);
        setShowDetailsModal(false);
      } else {
        throw new Error(response.message || 'Failed to reject pickup');
      }
    } catch (error) {
      console.error('Error rejecting pickup:', error);
      toast.error(error.message || 'Failed to reject pickup');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAgent = async () => {
    if (!selectedAgent) {
      toast.error('Please select an agent');
      return;
    }

    try {
      setLoading(true);
      const response = await pickupAPI.assignAgent(selectedPickup._id || selectedPickup.id, selectedAgent);
      
      if (response.success) {
        toast.success('Agent assigned successfully!');
        setShowAgentModal(false);
        setShowDetailsModal(false);
        setSelectedAgent('');
        await Promise.all([loadPickups(), loadStats()]);
      } else {
        throw new Error(response.message || 'Failed to assign agent');
      }
    } catch (error) {
      console.error('Error assigning agent:', error);
      toast.error(error.message || 'Failed to assign agent');
    } finally {
      setLoading(false);
    }
  };

  const handleShowAssignAgent = async () => {
    await loadAgents();
    setShowAgentModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'accepted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'assigned': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300';
      case 'in-progress': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
    }
  };

  const getWasteTypeColor = (wasteTypeId) => {
    return wasteTypes.find(wt => wt.id === wasteTypeId)?.color || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <Truck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                Pickup Schedule
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Schedule and manage your waste collection pickups
              </p>
            </div>
            
            <button
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Schedule Pickup
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.pending}
                </p>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              </div>
              <Calendar className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.inProgress}
                </p>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.completed}
                </p>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              </div>
              <Package className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {stats.total}
                </p>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pickups</p>
              </div>
              <Truck className="w-8 h-8 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </div>

        {/* Pickups List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Scheduled Pickups
            </h2>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : pickups.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No pickups scheduled
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Schedule your first pickup to get started.
              </p>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Schedule Pickup
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {pickups.map((pickup) => (
                <div 
                  key={pickup._id || pickup.id} 
                  onClick={() => handlePickupClick(pickup)}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(pickup.status)}`}>
                          {pickup.status.replace('-', ' ').toUpperCase()}
                        </span>
                        <div className="flex gap-1">
                          {pickup.wasteTypes.map(wasteType => (
                            <span
                              key={wasteType}
                              className={`w-3 h-3 rounded-full ${getWasteTypeColor(wasteType)}`}
                              title={wasteTypes.find(wt => wt.id === wasteType)?.label}
                            ></span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(pickup.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4 mr-2" />
                          {pickup.time}
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <MapPin className="w-4 h-4 mr-2" />
                          {pickup.location?.address || pickup.location}
                        </div>
                      </div>
                      
                      {pickup.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {pickup.notes}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => toast.info('Edit functionality coming soon!')}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="Edit pickup"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleCancelPickup(pickup._id)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Cancel pickup"
                        disabled={!['pending', 'accepted', 'assigned'].includes(pickup.status)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Schedule Pickup Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Schedule New Pickup
              </h3>
            </div>
            
            <form onSubmit={handleSchedulePickup} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={newPickup.date}
                  onChange={(e) => setNewPickup(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time *
                </label>
                <input
                  type="time"
                  value={newPickup.time}
                  onChange={(e) => setNewPickup(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  required
                />
              </div>
              
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter pickup address"
                    value={newPickup.location.address}
                    onChange={(e) => setNewPickup(prev => ({ ...prev, location: { ...prev.location, address: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    required
                  />
                </div>              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Waste Types * (Select at least one)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {wasteTypes.map(wasteType => (
                    <label
                      key={wasteType.id}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                        newPickup.wasteTypes.includes(wasteType.id)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={newPickup.wasteTypes.includes(wasteType.id)}
                        onChange={() => handleWasteTypeToggle(wasteType.id)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded ${wasteType.color} mr-2`}></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {wasteType.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Estimated Quantity (kg)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="0"
                      value={newPickup.estimatedQuantity}
                      onChange={(e) => setNewPickup(prev => ({ ...prev, estimatedQuantity: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={newPickup.priority}
                      onChange={(e) => setNewPickup(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      placeholder="Your name"
                      value={newPickup.contactInfo.contactPerson}
                      onChange={(e) => setNewPickup(prev => ({ ...prev, contactInfo: { ...prev.contactInfo, contactPerson: e.target.value } }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={newPickup.contactInfo.phone}
                      onChange={(e) => setNewPickup(prev => ({ ...prev, contactInfo: { ...prev.contactInfo, phone: e.target.value } }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    placeholder="Any special instructions or notes..."
                    value={newPickup.notes}
                    onChange={(e) => setNewPickup(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Schedule Pickup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pickup Details Modal */}
      {showDetailsModal && selectedPickup && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Pickup Request Details
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2"
                type="button"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6">

              
              {/* Pickup Information */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>Date:</strong> {selectedPickup.date ? new Date(selectedPickup.date).toLocaleDateString() : 'No date'}
                    </div>
                    <div>
                      <strong>Time:</strong> {selectedPickup.time || 'No time'}
                    </div>
                    <div>
                      <strong>Location:</strong> {selectedPickup.location?.address || selectedPickup.location || 'No location'}
                    </div>
                    <div>
                      <strong>Status:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded text-sm ${getStatusColor(selectedPickup.status || 'pending')}`}>
                        {(selectedPickup.status || 'pending').replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>Requested by:</strong> {selectedPickup.requestedBy?.name || 'Unknown'}
                    </div>
                    <div>
                      <strong>Phone:</strong> {selectedPickup.contactInfo?.phone || 'No phone'}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Waste Information</h3>
                  <div>
                    <strong>Types:</strong> {
                      selectedPickup.wasteTypes && selectedPickup.wasteTypes.length > 0 
                        ? selectedPickup.wasteTypes.join(', ')
                        : 'No waste types specified'
                    }
                  </div>
                  <div>
                    <strong>Estimated Quantity:</strong> {selectedPickup.estimatedQuantity || 0} kg
                  </div>
                </div>

                {selectedPickup.notes && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
                    <p className="bg-gray-50 p-3 rounded">{selectedPickup.notes}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons for NGO */}
              {user?.role === 'ngo' && selectedPickup.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t mt-6">
                  <button
                    onClick={() => handleAcceptPickup(selectedPickup._id || selectedPickup.id)}
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Accept Request'}
                  </button>
                  <button
                    onClick={() => handleRejectPickup(selectedPickup._id || selectedPickup.id)}
                    disabled={loading}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    Reject Request
                  </button>
                </div>
              )}

              {/* Assign Agent Button for Accepted Pickups */}
              {user?.role === 'ngo' && selectedPickup.status === 'accepted' && (
                <div className="flex gap-3 pt-4 border-t mt-6">
                  <button
                    onClick={handleShowAssignAgent}
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    Assign Agent
                  </button>
                </div>
              )}


            </div>
          </div>
        </div>
      )}

      {/* Agent Assignment Modal */}
      {showAgentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Assign Agent
                </h2>
                <button
                  onClick={() => {
                    setShowAgentModal(false);
                    setSelectedAgent('');
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Agent
                  </label>
                  <select
                    value={selectedAgent}
                    onChange={(e) => setSelectedAgent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Choose an agent...</option>
                    {availableAgents.map((agent) => (
                      <option key={agent._id || agent.id} value={agent._id || agent.id}>
                        {agent.name} - {agent.email}
                        {agent.phone && ` (${agent.phone})`}
                      </option>
                    ))}
                  </select>
                </div>

                {availableAgents.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No agents available. Please add agents to your organization first.
                  </p>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowAgentModal(false);
                      setSelectedAgent('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignAgent}
                    disabled={loading || !selectedAgent}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Assigning...' : 'Assign Agent'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PickupSchedule;
