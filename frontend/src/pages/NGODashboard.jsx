
import React, { useState, useEffect, useCallback, memo } from 'react'
import {
  Users,
  Calendar,
  TrendingUp,
  Briefcase,
  MapPin,
  MessageSquare,
  RefreshCw,
  Plus,
  X,
  Save,
  ChevronRight,
  Star,
  Sparkles,
  Zap,
  Clock,
  Phone,
  Mail,
  Eye,
  Edit,
  UserCheck,
  Heart,
  Award,
  Target,
  Activity,
  BarChart3,
  CheckCircle,
  XCircle,
  Trash2,
  Upload,
  Image,
  FileText,
  AlertCircle,
  Moon,
  Sun
} from 'lucide-react'
import { ngoAPI } from '../services/api'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import Side from '../components/Side'
import AttendanceManager from './AttendanceManager'
import WasteZeroAnalytics from './AnalyticDashboard'

// Modern CreateEventModal component with enhanced UI
const CreateEventModal = memo(({
  showModal,
  setShowModal,
  newEvent,
  handleNewEventChange,
  handleCreateEvent,
  loading
}) => {
  if (!showModal) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        handleNewEventChange('imagePreview', e.target.result);
        handleNewEventChange('image', file);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    handleNewEventChange('image', null);
    handleNewEventChange('imagePreview', null);
  };

  const handleSkillToggle = (skill) => {
    const currentSkills = newEvent.requiredSkills || [];
    const updatedSkills = currentSkills.includes(skill)
      ? currentSkills.filter(s => s !== skill)
      : [...currentSkills, skill];
    handleNewEventChange('requiredSkills', updatedSkills);
  };

  const handleWasteTypeToggle = (wasteType) => {
    const currentWasteTypes = newEvent.wasteTypes || [];
    const updatedWasteTypes = currentWasteTypes.includes(wasteType)
      ? currentWasteTypes.filter(w => w !== wasteType)
      : [...currentWasteTypes, wasteType];
    handleNewEventChange('wasteTypes', updatedWasteTypes);
  };

  const availableSkills = [
    'Environmental Conservation',
    'Community Organizing',
    'Event Management',
    'Public Speaking',
    'Social Media',
    'Photography',
    'First Aid',
    'Teaching',
    'Fundraising',
    'Technical Skills'
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
        {/* Compact Header */}
        <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Create Event</h3>
                <p className="text-emerald-50 text-sm">Build your community impact</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="w-9 h-9 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-140px)] px-6 py-4">
          <div className="space-y-5">
            {/* Basic Information Section */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">1</div>
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Basic Information</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Event Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => handleNewEventChange('title', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-400"
                    placeholder="Give your event a catchy title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1" />
                    Location <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => handleNewEventChange('location', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-400"
                    placeholder="City or address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    Event Date <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => handleNewEventChange('date', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all [color-scheme:dark]"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    Duration
                  </label>
                  <input
                    type="text"
                    value={newEvent.duration}
                    onChange={(e) => handleNewEventChange('duration', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-400"
                    placeholder="e.g., 4 hours"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center">
                    <Users className="w-3.5 h-3.5 mr-1" />
                    Capacity <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="number"
                    value={newEvent.capacity}
                    onChange={(e) => handleNewEventChange('capacity', e.target.value)}
                    min="1"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-400"
                    placeholder="Max participants"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Category
                  </label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => handleNewEventChange('category', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  >
                    <option value="environmental">Environmental</option>
                    <option value="social">Social</option>
                    <option value="education">Education</option>
                    <option value="health">Health</option>
                    <option value="community">Community</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => handleNewEventChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none placeholder:text-slate-400"
                    placeholder="Describe your event goals and activities..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    value={newEvent.applicationDeadline}
                    onChange={(e) => handleNewEventChange('applicationDeadline', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all [color-scheme:dark]"
                    min={new Date().toISOString().split('T')[0]}
                    max={newEvent.date ? new Date(new Date(newEvent.date).getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined}
                  />
                  {newEvent.date && newEvent.applicationDeadline && new Date(newEvent.applicationDeadline) >= new Date(newEvent.date) && (
                    <p className="text-red-500 text-xs mt-1">Must be before event date</p>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200 dark:border-slate-700"></div>

            {/* Matching Preferences */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-xs font-bold">2</div>
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Matching Preferences</h4>
              </div>

              {/* Waste Types */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Waste Types <span className="text-red-500">*</span>
                  <span className="ml-2 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs rounded-full">For matching</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[
                    { value: 'organic', label: 'Organic', emoji: '🥬' },
                    { value: 'plastic', label: 'Plastic', emoji: '🥤' },
                    { value: 'paper', label: 'Paper', emoji: '📄' },
                    { value: 'glass', label: 'Glass', emoji: '🍶' },
                    { value: 'metal', label: 'Metal', emoji: '🔧' },
                    { value: 'electronic', label: 'Electronic', emoji: '📱' },
                    { value: 'hazardous', label: 'Hazardous', emoji: '⚠️' },
                    { value: 'textile', label: 'Textile', emoji: '👕' },
                    { value: 'construction', label: 'Construction', emoji: '🧱' },
                    { value: 'medical', label: 'Medical', emoji: '💉' }
                  ].map((wasteType) => (
                    <label
                      key={wasteType.value}
                      className={`flex flex-col items-center justify-center cursor-pointer p-2 rounded-lg border transition-all ${
                        newEvent.wasteTypes?.includes(wasteType.value)
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                          : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={newEvent.wasteTypes?.includes(wasteType.value) || false}
                        onChange={() => handleWasteTypeToggle(wasteType.value)}
                        className="hidden"
                      />
                      <span className="text-2xl mb-1">{wasteType.emoji}</span>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300 text-center">{wasteType.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Experience and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Experience Level
                  </label>
                  <select
                    value={newEvent.requiredExperienceLevel}
                    onChange={(e) => handleNewEventChange('requiredExperienceLevel', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  >
                    <option value="beginner">🌱 Beginner</option>
                    <option value="intermediate">🌿 Intermediate</option>
                    <option value="advanced">🌳 Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Time of Day
                  </label>
                  <select
                    value={newEvent.timeOfDay}
                    onChange={(e) => handleNewEventChange('timeOfDay', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  >
                    <option value="morning">🌅 Morning</option>
                    <option value="afternoon">☀️ Afternoon</option>
                    <option value="evening">🌆 Evening</option>
                    <option value="full-day">🌍 Full Day</option>
                  </select>
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Required Skills (Optional)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availableSkills.map((skill) => (
                    <label
                      key={skill}
                      className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={newEvent.requiredSkills?.includes(skill) || false}
                        onChange={() => handleSkillToggle(skill)}
                        className="w-4 h-4 text-emerald-600 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded focus:ring-emerald-500"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200 dark:border-slate-700"></div>

            {/* Event Image */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xs font-bold">3</div>
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Event Banner</h4>
              </div>

              {!newEvent.imagePreview ? (
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 text-center hover:border-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all bg-slate-50 dark:bg-slate-800/50">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Upload an image to attract volunteers</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors text-sm font-medium"
                  >
                    Choose Image
                  </label>
                  <p className="text-xs text-slate-400 mt-2">PNG, JPG up to 5MB</p>
                </div>
              ) : (
                <div className="relative rounded-lg overflow-hidden group">
                  <img
                    src={newEvent.imagePreview}
                    alt="Event preview"
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={removeImage}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="font-semibold text-amber-900 dark:text-amber-100 text-sm mb-1">Quick Tips</h5>
                  <p className="text-xs text-amber-800 dark:text-amber-200">Use clear titles, specify waste types for better matching, and add an engaging image to attract more volunteers.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full mr-1.5"></span>
              Waste types improve volunteer matching
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEvent}
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg hover:from-emerald-700 hover:to-cyan-700 disabled:opacity-50 transition-all text-sm font-medium shadow-lg shadow-emerald-500/25 flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    <span>Create Event</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

CreateEventModal.displayName = 'CreateEventModal';
// Extracted EditEventModal component
const EditEventModal = memo(({
  showModal,
  setShowModal,
  editEvent,
  handleEditEventChange,
  handleUpdateEvent,
  loading
}) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/80 via-gray-900/90 to-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-[0_20px_80px_rgba(0,0,0,0.3)] border border-gray-200/50 dark:border-gray-700/50">
        <div className="relative bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white p-8">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
          <div className="relative flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Edit className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-black">Edit Event</h3>
                <p className="text-blue-100 font-medium">Update event details</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="p-3 hover:bg-white/20 rounded-2xl transition-all duration-300 hover:rotate-90 backdrop-blur-sm"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center">
                <Target className="w-4 h-4 mr-2 text-blue-500" />
                Event Title *
              </label>
              <input
                type="text"
                value={editEvent.title}
                onChange={(e) => handleEditEventChange('title', e.target.value)}
                className="w-full px-5 py-4 border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 font-medium"
                placeholder="Event title"
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
                Location *
              </label>
              <input
                type="text"
                value={editEvent.location}
                onChange={(e) => handleEditEventChange('location', e.target.value)}
                className="w-full px-5 py-4 border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 font-medium"
                placeholder="Event location"
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                Date *
              </label>
              <input
                type="date"
                value={editEvent.date}
                onChange={(e) => handleEditEventChange('date', e.target.value)}
                className="w-full px-5 py-4 border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 font-medium [color-scheme:dark]"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center">
                <Users className="w-4 h-4 mr-2 text-pink-500" />
                Capacity *
              </label>
              <input
                type="number"
                value={editEvent.capacity}
                onChange={(e) => handleEditEventChange('capacity', e.target.value)}
                min="1"
                className="w-full px-5 py-4 border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300 font-medium"
                placeholder="Max participants"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                Category
              </label>
              <select
                value={editEvent.category}
                onChange={(e) => handleEditEventChange('category', e.target.value)}
                className="w-full px-5 py-4 border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 font-medium"
              >
                <option value="environmental">🌱 Environmental</option>
                <option value="social">🤝 Social</option>
                <option value="education">📚 Education</option>
                <option value="health">💚 Health</option>
                <option value="community">🏘️ Community</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-cyan-500" />
                Duration
              </label>
              <input
                type="text"
                value={editEvent.duration}
                onChange={(e) => handleEditEventChange('duration', e.target.value)}
                className="w-full px-5 py-4 border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 font-medium"
                placeholder="e.g., 4 hours"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                Application Deadline
              </label>
              <input
                type="date"
                value={editEvent.applicationDeadline}
                onChange={(e) => handleEditEventChange('applicationDeadline', e.target.value)}
                className="w-full px-5 py-4 border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-2xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-300 font-medium [color-scheme:dark]"
                min={new Date().toISOString().split('T')[0]}
                max={editEvent.date ? new Date(new Date(editEvent.date).getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined}
              />
              {editEvent.date && editEvent.applicationDeadline && new Date(editEvent.applicationDeadline) >= new Date(editEvent.date) && (
                <p className="text-rose-500 text-sm font-semibold mt-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Deadline must be before event date
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
              Description *
            </label>
            <textarea
              value={editEvent.description}
              onChange={(e) => handleEditEventChange('description', e.target.value)}
              rows={4}
              className="w-full px-5 py-4 border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 font-medium resize-none"
              placeholder="Event description"
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">
              Required Skills
            </label>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 max-h-64 overflow-y-auto shadow-inner border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-3">
                {['Environmental Conservation', 'Community Organizing', 'Event Management', 'Public Speaking', 'Social Media', 'Photography', 'First Aid', 'Teaching', 'Fundraising', 'Technical Skills'].map((skill) => (
                  <label
                    key={skill}
                    className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 group"
                  >
                    <input
                      type="checkbox"
                      checked={editEvent.requiredSkills?.includes(skill) || false}
                      onChange={() => {
                        const skills = editEvent.requiredSkills || [];
                        if (skills.includes(skill)) {
                          handleEditEventChange('requiredSkills', skills.filter(s => s !== skill));
                        } else {
                          handleEditEventChange('requiredSkills', [...skills, skill]);
                        }
                      }}
                      className="w-5 h-5 text-blue-600 bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{skill}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowModal(false)}
              className="px-8 py-4 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 font-bold shadow-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateEvent}
              disabled={loading}
              className="px-10 py-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white rounded-2xl hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 disabled:opacity-50 transition-all duration-300 font-bold shadow-2xl flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Edit className="w-5 h-5" />
                  <span>Update Event</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

EditEventModal.displayName = 'EditEventModal';

// Redesigned DeleteConfirmationModal
const DeleteConfirmationModal = memo(({
  showModal,
  setShowModal,
  eventToDelete,
  onConfirm,
  loading
}) => {
  if (!showModal || !eventToDelete) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/80 via-gray-900/90 to-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-gradient-to-br from-white via-red-50 to-white dark:from-gray-900 dark:via-red-900/20 dark:to-gray-900 rounded-3xl max-w-lg w-full shadow-[0_20px_80px_rgba(0,0,0,0.3)] border border-red-200/50 dark:border-red-700/50 overflow-hidden">
        <div className="relative bg-gradient-to-r from-rose-500 via-red-500 to-pink-500 p-6">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
          <div className="relative flex items-center justify-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-white animate-pulse" />
            </div>
          </div>
        </div>

        <div className="p-8">
          <h3 className="text-3xl font-black text-gray-900 dark:text-gray-100 text-center mb-3">
            Delete Event?
          </h3>

          <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-2xl p-6 mb-6 border border-red-200 dark:border-red-800">
            <p className="text-gray-700 dark:text-gray-300 text-center text-lg">
              You're about to delete <span className="font-black text-red-600 dark:text-red-400">"{eventToDelete.title}"</span>
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-center mt-2 text-sm">
              This action is permanent and cannot be undone. All data will be lost forever.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setShowModal(false)}
              disabled={loading}
              className="flex-1 px-6 py-4 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 disabled:opacity-50 font-bold shadow-lg"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-2xl hover:from-rose-600 hover:to-red-700 disabled:opacity-50 transition-all duration-300 flex items-center justify-center font-bold shadow-2xl"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Deleting...
                </>
              ) : (
                'Delete Forever'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

DeleteConfirmationModal.displayName = 'DeleteConfirmationModal';

// Redesigned ViewEventDetailsModal
const ViewEventDetailsModal = memo(({
  showModal,
  setShowModal,
  event
}) => {
  if (!showModal || !event) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/80 via-gray-900/90 to-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-[0_20px_80px_rgba(0,0,0,0.3)] border border-gray-200/50 dark:border-gray-700/50">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 text-white p-8 rounded-t-3xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
          <div className="relative flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-4xl font-black tracking-tight">{event.title}</h3>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                  event.status === 'active' ? 'bg-emerald-400 text-emerald-900' :
                  event.status === 'inactive' ? 'bg-rose-400 text-rose-900' :
                  event.status === 'full' ? 'bg-orange-400 text-orange-900' :
                  'bg-gray-400 text-gray-900'
                }`}>
                  {event.status?.toUpperCase()}
                </span>
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-bold shadow-lg">
                  {event.category}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="p-3 hover:bg-white/20 rounded-2xl transition-all duration-300 hover:rotate-90 backdrop-blur-sm flex-shrink-0"
            >
              <X className="w-7 h-7" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Event Image */}
          {event.imageUrl && (
            <div className="mb-8 rounded-3xl overflow-hidden shadow-2xl border-4 border-purple-200 dark:border-purple-700">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-80 object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-wide">Location</h4>
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-medium text-lg">{event.location}</p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-wide">Event Date</h4>
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-medium text-lg">{new Date(event.date).toLocaleDateString()}</p>
              </div>
            </div>

            {event.duration && (
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-wide">Duration</h4>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium text-lg">{event.duration}</p>
                </div>
              </div>
            )}

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-rose-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-gradient-to-br from-orange-50 to-rose-50 dark:from-orange-900/20 dark:to-rose-900/20 rounded-2xl p-6 border border-orange-200 dark:border-orange-800">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-wide">Capacity</h4>
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-medium text-lg mb-3">
                  {event.registered || 0}/{event.capacity} registered
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-rose-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                    style={{ width: `${((event.registered || 0) / event.capacity) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {event.applicationDeadline && (
              <div className="relative group md:col-span-2">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-400 to-pink-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                <div className="relative bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-800">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-wide">Application Deadline</h4>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium text-lg">{new Date(event.applicationDeadline).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-2xl font-black text-gray-900 dark:text-gray-100">About This Event</h4>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-800 shadow-lg">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">{event.description}</p>
            </div>
          </div>

          {/* Required Skills */}
          {event.requiredSkills && event.requiredSkills.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-2xl font-black text-gray-900 dark:text-gray-100">Required Skills</h4>
              </div>
              <div className="flex flex-wrap gap-3">
                {event.requiredSkills.map((skill, index) => (
                  <span 
                    key={index} 
                    className="px-5 py-3 bg-gradient-to-br from-teal-400 to-cyan-400 text-white text-sm font-bold rounded-full shadow-lg hover:scale-105 transition-transform duration-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowModal(false)}
              className="flex-1 px-6 py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 font-bold shadow-lg border-2 border-gray-200 dark:border-gray-600"
            >
              Close
            </button>
            <button
              onClick={() => {
                setShowModal(false);
              }}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-2xl hover:from-violet-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center gap-3 font-bold shadow-2xl"
            >
              <Edit className="w-5 h-5" />
              Edit Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

ViewEventDetailsModal.displayName = 'ViewEventDetailsModal';

// Application Management Modal component
const ApplicationManagementModal = memo(({
  showModal,
  setShowModal,
  selectedEvent,
  applications,
  onApproveApplication,
  onRejectApplication,
  loading
}) => {
  if (!showModal || !selectedEvent) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/70 to-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-gradient-to-br from-slate-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-3xl max-w-5xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]"></div>
          <div className="relative flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-5 h-5 text-white/90" />
                <span className="text-white/80 text-sm font-medium">Application Management</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{selectedEvent.title}</h3>
              <p className="text-indigo-100 text-sm">
                {applications.length} {applications.length === 1 ? 'application' : 'applications'} received
              </p>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:rotate-90 transform"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-180px)] p-6">
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-indigo-400 dark:text-indigo-500" />
              </div>
              <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">No Applications Yet</h4>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                When volunteers apply for this event, their applications will appear here for review.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <div 
                  key={application.id} 
                  className="group bg-white dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300"
                >
                  {/* Application Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {application.volunteerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                          {application.volunteerName}
                        </h4>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          application.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
                          application.status === 'accepted' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
                          'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                        }`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    {application.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => onApproveApplication(application.id)}
                          disabled={loading}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium flex items-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => onRejectApplication(application.id)}
                          disabled={loading}
                          className="px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium flex items-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Application Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                        <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Email</p>
                        <p className="text-sm text-gray-900 dark:text-gray-100 truncate">{application.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                        <Phone className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Phone</p>
                        <p className="text-sm text-gray-900 dark:text-gray-100">{application.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                        <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Applied</p>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {new Date(application.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                        <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Experience</p>
                        <p className="text-sm text-gray-900 dark:text-gray-100">{application.experience}</p>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  {application.skills && application.skills.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {application.skills.map((skill, index) => (
                          <span 
                            key={index} 
                            className="px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-lg border border-indigo-200 dark:border-indigo-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message */}
                  {application.message && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Message</p>
                      <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{application.message}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-end">
            <button
              onClick={() => setShowModal(false)}
              className="px-6 py-2.5 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-medium shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

ApplicationManagementModal.displayName = 'ApplicationManagementModal';

const NGODashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedEventForAttendance, setSelectedEventForAttendance] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Community Garden Project',
      description: 'Create sustainable community gardens in urban areas',
      location: 'Green Valley Community Center',
      date: '2025-09-20',
      capacity: 30,
      registered: 15,
      status: 'active',
      category: 'Environmental',
      createdBy: 'Green Earth NGO'
    },
    {
      id: 2,
      title: 'Recycling Awareness Workshop',
      description: 'Educational workshop on proper recycling practices',
      location: 'Community Library',
      date: '2025-09-25',
      capacity: 25,
      registered: 18,
      status: 'active',
      category: 'Education',
      createdBy: 'Green Earth NGO'
    }
  ]);

  const [newEvent, setNewEvent] = useState({
    title: '', description: '', location: '', date: '', capacity: '',
    category: 'environmental', image: null, imagePreview: null, duration: '',
    requiredSkills: [], applicationDeadline: '', wasteTypes: [],
    requiredExperienceLevel: 'beginner', timeOfDay: 'morning',
    coordinates: { latitude: null, longitude: null }
  });

  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editEvent, setEditEvent] = useState({
    title: '', description: '', location: '', date: '', capacity: '',
    category: 'environmental', image: null, imagePreview: null, duration: '',
    requiredSkills: [], applicationDeadline: ''
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [showViewDetailsModal, setShowViewDetailsModal] = useState(false);
  const [selectedEventForDetails, setSelectedEventForDetails] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedEventForApplications, setSelectedEventForApplications] = useState(null);

  const mockApplications = [
    {
      id: 1, eventId: 1, volunteerName: 'Alice Johnson',
      email: 'alice.johnson@email.com', phone: '+1 234-567-8901',
      status: 'pending', appliedAt: '2024-09-10', experience: 'Beginner',
      skills: ['Environmental Advocacy', 'Event Planning'],
      message: 'I am passionate about environmental conservation.'
    }
  ];

  const [applications, setApplications] = useState(mockApplications);

  const handleNewEventChange = useCallback((field, value) => {
    setNewEvent(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleEditEventChange = useCallback((field, value) => {
    setEditEvent(prev => ({ ...prev, [field]: value }));
  }, []);

  const [volunteers, setVolunteers] = useState([
    {
      id: 1, name: 'Alice Johnson', email: 'alice.johnson@email.com',
      phone: '+1 234-567-8901', skills: ['Environmental Advocacy', 'Event Planning'],
      registeredEvents: ['Community Garden Project', 'River Cleanup Drive'],
      totalHours: 25, status: 'active', joinDate: '2024-08-15'
    }
  ]);

  const [stats, setStats] = useState([
    { title: 'Active Events', value: '0', change: '+0', icon: Calendar, color: 'from-blue-500 to-blue-600', bgPattern: 'bg-blue-50' },
    { title: 'Total Volunteers', value: '0', change: '+0', icon: Users, color: 'from-emerald-500 to-emerald-600', bgPattern: 'bg-emerald-50' },
    { title: 'Total Impact Hours', value: '0', change: '+0', icon: Clock, color: 'from-purple-500 to-purple-600', bgPattern: 'bg-purple-50' },
    { title: 'Events Completed', value: '0', change: '+0', icon: Award, color: 'from-orange-500 to-orange-600', bgPattern: 'bg-orange-50' }
  ]);

  const getActivityIcon = (iconType) => {
    const iconProps = { className: "w-5 h-5" };
    switch (iconType) {
      case 'user-check': return <UserCheck {...iconProps} className="w-5 h-5 text-emerald-500" />;
      case 'calendar': return <Calendar {...iconProps} className="w-5 h-5 text-blue-500" />;
      case 'calendar-plus': return <Plus {...iconProps} className="w-5 h-5 text-purple-500" />;
      case 'check-circle': return <CheckCircle {...iconProps} className="w-5 h-5 text-emerald-600" />;
      case 'heart': return <Heart {...iconProps} className="w-5 h-5 text-rose-500" />;
      case 'edit': return <Edit {...iconProps} className="w-5 h-5 text-amber-500" />;
      default: return <Activity {...iconProps} className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMs = now - activityTime;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
    } else if (diffInDays === 1) {
      return '1 day ago';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return activityTime.toLocaleDateString();
    }
  };

  const refreshRecentActivities = async () => {
    try {
      setActivitiesLoading(true);
      const activitiesResponse = await ngoAPI.getRecentActivities();
      const activitiesData = activitiesResponse.data || [];
      setRecentActivities(activitiesData);
    } catch (error) {
      console.error('Error refreshing activities:', error);
      toast.error('Failed to refresh activities');
    } finally {
      setActivitiesLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, eventsResponse, activitiesResponse] = await Promise.all([
        ngoAPI.getDashboardStats(),
        ngoAPI.getMyEvents(),
        ngoAPI.getRecentActivities()
      ]);
      const statsData = statsResponse.data || statsResponse;
      const eventsData = eventsResponse.data || eventsResponse;
      const activitiesData = activitiesResponse.data || [];
      setRecentActivities(activitiesData);
      setStats([
        { title: 'Active Events', value: statsData.activeEvents || '0', change: '+2', icon: Calendar, color: 'from-blue-500 to-blue-600', bgPattern: 'bg-blue-50' },
        { title: 'Total Volunteers', value: statsData.totalVolunteers || '0', change: '+12', icon: Users, color: 'from-emerald-500 to-emerald-600', bgPattern: 'bg-emerald-50' },
        { title: 'Total Impact Hours', value: statsData.totalHours || statsData.totalImpactHours || '0', change: '+45', icon: Clock, color: 'from-purple-500 to-purple-600', bgPattern: 'bg-purple-50' },
        { title: 'Events Completed', value: statsData.completedEvents || statsData.eventsCompleted || '0', change: '+3', icon: Award, color: 'from-orange-500 to-orange-600', bgPattern: 'bg-orange-50' }
      ]);
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error(`Failed to load dashboard data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.description || !newEvent.location || !newEvent.date || !newEvent.capacity) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!newEvent.wasteTypes || newEvent.wasteTypes.length === 0) {
      toast.error('Please select at least one waste type');
      return;
    }
    if (newEvent.applicationDeadline && newEvent.date) {
      if (new Date(newEvent.applicationDeadline) >= new Date(newEvent.date)) {
        toast.error('Application deadline must be before the event date');
        return;
      }
    }
    try {
      setLoading(true);
      const eventData = { ...newEvent, capacity: parseInt(newEvent.capacity), image: newEvent.imagePreview || null };
      delete eventData.imagePreview;
      const response = await ngoAPI.createEvent(eventData);
      setNewEvent({
        title: '', description: '', location: '', date: '', capacity: '',
        category: 'environmental', image: null, imagePreview: null, duration: '',
        requiredSkills: [], applicationDeadline: '', wasteTypes: [],
        requiredExperienceLevel: 'beginner', timeOfDay: 'morning',
        coordinates: { latitude: null, longitude: null }
      });
      setShowCreateEventModal(false);
      toast.success('Event created successfully!');
      loadDashboardData();
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error(error.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setEditEvent({
      title: event.title, description: event.description, location: event.location,
      date: event.date, capacity: event.capacity.toString(),
      category: event.category || 'environmental', image: null,
      imagePreview: event.imageUrl || null, duration: event.duration || '',
      requiredSkills: event.requiredSkills || [], applicationDeadline: event.applicationDeadline || ''
    });
    setShowEditEventModal(true);
  };

  const handleUpdateEvent = async () => {
    if (!editEvent.title || !editEvent.description || !editEvent.location || !editEvent.date || !editEvent.capacity) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (editEvent.applicationDeadline && editEvent.date) {
      if (new Date(editEvent.applicationDeadline) >= new Date(editEvent.date)) {
        toast.error('Application deadline must be before the event date');
        return;
      }
    }
    try {
      setLoading(true);
      const eventData = { ...editEvent, capacity: parseInt(editEvent.capacity) };
      await ngoAPI.updateEvent(editingEvent._id || editingEvent.id, eventData);
      setShowEditEventModal(false);
      setEditingEvent(null);
      setEditEvent({
        title: '', description: '', location: '', date: '', capacity: '',
        category: 'environmental', image: null, imagePreview: null, duration: '',
        requiredSkills: [], applicationDeadline: ''
      });
      toast.success('Event updated successfully!');
      loadDashboardData();
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error(error.response?.data?.message || 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = (event) => {
    setEventToDelete(event);
    setShowDeleteModal(true);
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    try {
      setLoading(true);
      await ngoAPI.deleteEvent(eventToDelete._id || eventToDelete.id);
      toast.success('Event deleted successfully!');
      setShowDeleteModal(false);
      setEventToDelete(null);
      loadDashboardData();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error(error.response?.data?.message || 'Failed to delete event');
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplications = async (event) => {
    setSelectedEventForApplications(event);
    setShowApplicationModal(true);
    try {
      setLoading(true);
      const applicationsResponse = await ngoAPI.getEventRegistrations(event._id || event.id);
      setApplications(applicationsResponse.data || applicationsResponse || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
      setApplications(mockApplications.filter(app => app.eventId === (event._id || event.id)));
    } finally {
      setLoading(false);
    }
  };

  const handleViewEventDetails = (event) => {
    setSelectedEventForDetails(event);
    setShowViewDetailsModal(true);
  };

  const handleApproveApplication = async (applicationId) => {
    if (!selectedEventForApplications) return;
    try {
      setLoading(true);
      await ngoAPI.reviewApplication(selectedEventForApplications._id || selectedEventForApplications.id, applicationId, { status: 'accepted' });
      setApplications(prev => prev.map(app =>
        app._id === applicationId || app.id === applicationId ? { ...app, status: 'approved' } : app
      ));
      toast.success('Application approved successfully!');
      loadDashboardData();
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error(error.response?.data?.message || 'Failed to approve application');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectApplication = async (applicationId) => {
    if (!selectedEventForApplications) return;
    try {
      setLoading(true);
      await ngoAPI.reviewApplication(selectedEventForApplications._id || selectedEventForApplications.id, applicationId, { status: 'rejected' });
      setApplications(prev => prev.map(app =>
        app._id === applicationId || app.id === applicationId ? { ...app, status: 'rejected' } : app
      ));
      toast.success('Application rejected successfully!');
      loadDashboardData();
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error(error.response?.data?.message || 'Failed to reject application');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewApplication = async (eventId, applicationId, status, reviewNote = '') => {
    try {
      await ngoAPI.reviewApplication(eventId, applicationId, { status, reviewNote });
      toast.success(`Application ${status} successfully!`);
      loadDashboardData();
    } catch (error) {
      console.error('Error reviewing application:', error);
      toast.error('Failed to review application');
    }
  };

  const updateEventStatus = async (eventId, newStatus) => {
    try {
      setLoading(true);
      await ngoAPI.updateEvent(eventId, { status: newStatus });
      setEvents(events.map(event =>
        event.id === eventId ? { ...event, status: newStatus } : event
      ));
      toast.success(`Event ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error('Error updating event status:', error);
      toast.error('Failed to update event status');
    } finally {
      setLoading(false);
    }
  };

  const renderDashboardTab = () => (
    <div className="space-y-8">
      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-transparent hover:-translate-y-1"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      {stat.change}
                    </span>
                    <span className="text-xs text-gray-500">this month</span>
                  </div>
                </div>
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000 group-hover:w-full`} style={{width: '60%'}}></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Quick Actions */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Plus, text: 'Create New Event', color: 'from-blue-500 to-blue-600', action: () => setShowCreateEventModal(true) },
            { icon: Users, text: 'Manage Volunteers', color: 'from-emerald-500 to-emerald-600', action: () => setActiveTab('volunteers') },
            { icon: Calendar, text: 'View All Events', color: 'from-purple-500 to-purple-600', action: () => setActiveTab('events') },
            { icon: UserCheck, text: 'Review Applications', color: 'from-amber-500 to-amber-600', action: () => {
              const eventsWithApplications = events.filter(event =>
                applications.some(app => app.eventId === event.id && app.status === 'pending')
              );
              if (eventsWithApplications.length > 0) {
                handleViewApplications(eventsWithApplications[0]);
              } else {
                toast.info('No pending applications at the moment');
              }
            }}
          ].map((action, idx) => (
            <button
              key={idx}
              onClick={action.action}
              className="group relative overflow-hidden bg-white rounded-xl p-6 border-2 border-gray-100 hover:border-transparent hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              <div className="relative flex flex-col items-center text-center gap-3">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <span className="font-semibold text-gray-900 group-hover:text-white transition-colors duration-300">
                  {action.text}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Recent Activity */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Recent Activity</h3>
          </div>
          <button
            onClick={refreshRecentActivities}
            disabled={activitiesLoading}
            className="p-3 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-200 disabled:opacity-50 hover:shadow-md"
          >
            <RefreshCw className={`w-5 h-5 ${activitiesLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {activitiesLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent"></div>
            <span className="ml-3 text-gray-600 font-medium">Loading activities...</span>
          </div>
        ) : recentActivities.length > 0 ? (
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="group flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-emerald-200">
                <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                  {getActivityIcon(activity.icon)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 mb-1">{activity.message}</p>
                  <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                  {activity.details && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {activity.details.category && (
                        <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                          {activity.details.category}
                        </span>
                      )}
                      {activity.details.location && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {activity.details.location}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {activity.status && (
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap ${
                    activity.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                    activity.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    activity.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {activity.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Activity className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium mb-1">No recent activities</p>
            <p className="text-sm text-gray-400">Activities will appear here as they happen</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderEventsTab = () => (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl shadow-lg border border-emerald-100 p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                My Events
              </h2>
            </div>
            <p className="text-gray-600 ml-16">Manage and track your organization's events</p>
          </div>
          <button
            onClick={() => setShowCreateEventModal(true)}
            className="group bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-4 rounded-2xl flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 font-semibold"
          >
            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
            Create New Event
          </button>
        </div>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-16 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Calendar className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No Events Yet</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">Start by creating your first event to engage volunteers and make an impact</p>
          <button
            onClick={() => setShowCreateEventModal(true)}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-4 rounded-2xl flex items-center gap-3 transition-all duration-300 mx-auto shadow-lg hover:shadow-xl font-semibold"
          >
            <Plus className="w-5 h-5" />
            Create Your First Event
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-emerald-200 hover:-translate-y-1"
            >
              <div className="p-8">
                {/* Event Header */}
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 mb-6">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <h3 className="text-2xl font-bold text-gray-900">{event.title}</h3>
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                        event.status === 'active' ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-200' :
                        event.status === 'inactive' ? 'bg-rose-100 text-rose-700 ring-2 ring-rose-200' :
                        event.status === 'full' ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-200' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {event.status}
                      </span>
                      <span className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-xs font-bold uppercase tracking-wide shadow-md">
                        {event.category}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-6 leading-relaxed">{event.description}</p>

                    {/* Event Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="group/card bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 hover:shadow-md transition-all">
                        <div className="flex items-center text-blue-600 mb-2">
                          <MapPin className="w-5 h-5 mr-2" />
                          <span className="text-sm font-bold uppercase tracking-wide">Location</span>
                        </div>
                        <p className="text-gray-900 font-semibold">{event.location}</p>
                      </div>

                      <div className="group/card bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200 hover:shadow-md transition-all">
                        <div className="flex items-center text-purple-600 mb-2">
                          <Calendar className="w-5 h-5 mr-2" />
                          <span className="text-sm font-bold uppercase tracking-wide">Date</span>
                        </div>
                        <p className="text-gray-900 font-semibold">{new Date(event.date).toLocaleDateString()}</p>
                      </div>

                      <div className="group/card bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200 hover:shadow-md transition-all">
                        <div className="flex items-center text-emerald-600 mb-2">
                          <Users className="w-5 h-5 mr-2" />
                          <span className="text-sm font-bold uppercase tracking-wide">Capacity</span>
                        </div>
                        <p className="text-gray-900 font-semibold">{event.registered}/{event.capacity} registered</p>
                      </div>

                      <div className="group/card bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200 hover:shadow-md transition-all">
                        <div className="flex items-center text-amber-600 mb-2">
                          <UserCheck className="w-5 h-5 mr-2" />
                          <span className="text-sm font-bold uppercase tracking-wide">Applications</span>
                        </div>
                        <p className="text-gray-900 font-semibold">
                          {applications.filter(app => app.eventId === event.id && app.status === 'pending').length} pending
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap lg:flex-col gap-2 lg:flex-shrink-0">
                    <button
                      onClick={() => handleViewEventDetails(event)}
                      className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">View Details</span>
                    </button>

                    <button
                      onClick={() => handleEditEvent(event)}
                      className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>

                    <button
                      onClick={() => handleViewApplications(event)}
                      className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span className="hidden sm:inline">Applications</span>
                    </button>

                    <button
                      onClick={() => updateEventStatus(event.id, event.status === 'active' ? 'inactive' : 'active')}
                      className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 ${
                        event.status === 'active'
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700'
                          : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700'
                      }`}
                    >
                      {event.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      <span className="hidden sm:inline">
                        {event.status === 'active' ? 'Deactivate' : 'Activate'}
                      </span>
                    </button>

                    <button
                      onClick={() => handleDeleteEvent(event)}
                      className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl hover:from-rose-600 hover:to-rose-700 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-700">Registration Progress</span>
                    <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                      {Math.round((event.registered / event.capacity) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                    <div
                      className={`h-4 rounded-full transition-all duration-1000 shadow-md ${
                        (event.registered / event.capacity) * 100 >= 100 ? 'bg-gradient-to-r from-rose-500 to-rose-600' :
                        (event.registered / event.capacity) * 100 >= 80 ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                        'bg-gradient-to-r from-emerald-500 to-emerald-600'
                      }`}
                      style={{ width: `${Math.min((event.registered / event.capacity) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderVolunteersTab = () => (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-lg border border-purple-100 p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Registered Volunteers
              </h2>
            </div>
            <p className="text-gray-600 ml-16">Manage volunteers registered for your events</p>
          </div>
          <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl shadow-md border border-gray-200">
            <Users className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-bold text-gray-900">Total: {volunteers.length} volunteers</span>
          </div>
        </div>
      </div>

      {/* Volunteers Grid */}
      {volunteers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-16 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Users className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No Volunteers Yet</h3>
          <p className="text-gray-600 max-w-md mx-auto">Volunteers will appear here when they register for your events</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {volunteers.map((volunteer) => (
            <div
              key={volunteer.id}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 hover:border-purple-200 hover:-translate-y-1"
            >
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
                <div className="flex-1">
                  {/* Volunteer Header */}
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {volunteer.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{volunteer.name}</h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mt-1 ${
                        volunteer.status === 'active' ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-200' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {volunteer.status}
                      </span>
                    </div>
                  </div>

                  {/* Contact Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center text-blue-600 mb-2">
                        <Mail className="w-5 h-5 mr-2" />
                        <span className="text-xs font-bold uppercase tracking-wide">Email</span>
                      </div>
                      <p className="text-gray-900 font-semibold text-sm break-all">{volunteer.email}</p>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
                      <div className="flex items-center text-emerald-600 mb-2">
                        <Phone className="w-5 h-5 mr-2" />
                        <span className="text-xs font-bold uppercase tracking-wide">Phone</span>
                      </div>
                      <p className="text-gray-900 font-semibold text-sm">{volunteer.phone}</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                      <div className="flex items-center text-purple-600 mb-2">
                        <Clock className="w-5 h-5 mr-2" />
                        <span className="text-xs font-bold uppercase tracking-wide">Hours</span>
                      </div>
                      <p className="text-gray-900 font-semibold text-sm">{volunteer.totalHours} hours</p>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                      <div className="flex items-center text-amber-600 mb-2">
                        <Calendar className="w-5 h-5 mr-2" />
                        <span className="text-xs font-bold uppercase tracking-wide">Joined</span>
                      </div>
                      <p className="text-gray-900 font-semibold text-sm">{new Date(volunteer.joinDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" />
                      Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {volunteer.skills.map((skill, index) => (
                        <span key={index} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm rounded-full font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Registered Events Section */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-500" />
                      Registered Events
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {volunteer.registeredEvents.map((event, index) => (
                        <span key={index} className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm rounded-full font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
                          {event}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 lg:flex-col lg:flex-shrink-0">
                  <button
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="hidden sm:inline">Contact</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAttendanceTab = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-lg border border-indigo-100 p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg">
                <UserCheck className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Event Attendance
              </h2>
            </div>
            <p className="text-gray-600 ml-16">Manage volunteer attendance for your events</p>
          </div>
        </div>

        {/* Event Selection Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.filter(event => event.status === 'active').map(event => (
            <div key={event.id} className="group bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-lg flex-1 pr-2">{event.title}</h3>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full ring-2 ring-emerald-200 whitespace-nowrap">
                  Active
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  <Calendar className="w-5 h-5 mr-3 text-indigo-500" />
                  <span className="font-medium">{new Date(event.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  <MapPin className="w-5 h-5 mr-3 text-rose-500" />
                  <span className="font-medium">{event.location}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  <Users className="w-5 h-5 mr-3 text-emerald-500" />
                  <span className="font-medium">{event.registered} registered volunteers</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedEventForAttendance(event.id);
                  setShowAttendanceModal(true);
                }}
                className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl group-hover:-translate-y-0.5"
              >
                <UserCheck className="w-5 h-5" />
                Manage Attendance
              </button>
            </div>
          ))}
        </div>

        {events.filter(event => event.status === 'active').length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <UserCheck className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Active Events</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Create an event to start managing volunteer attendance</p>
            <button
              onClick={() => setShowCreateEventModal(true)}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-8 py-4 rounded-2xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
            >
              Create Event
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar />

      <div className="flex">
        <Side />

        <div className="flex-1">
          {/* Modern Header with Gradient */}
          <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 shadow-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center space-x-5">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl ring-4 ring-white/30">
                    <BarChart3 className="w-9 h-9 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-black text-white drop-shadow-lg">
                      NGO Dashboard
                    </h1>
                    <p className="text-emerald-50 mt-1 font-medium">Event & Volunteer Management System</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => window.location.reload()}
                    disabled={loading}
                    className="bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white px-5 py-3 rounded-xl hover:bg-white/30 transition-all duration-200 flex items-center space-x-2 text-sm font-semibold shadow-lg hover:shadow-xl"
                  >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                  <button
                    onClick={() => setShowCreateEventModal(true)}
                    disabled={loading}
                    className="bg-white text-emerald-600 px-6 py-3 rounded-xl hover:bg-emerald-50 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2 text-sm font-bold shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">Create Event</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Modern Navigation Tabs */}
          <div className="bg-white border-b-2 border-gray-100 sticky top-16 z-40 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <nav className="flex space-x-2 py-4 overflow-x-auto">
                {[
                  { id: 'dashboard', label: 'Overview', icon: BarChart3, color: 'emerald' },
                  { id: 'events', label: 'My Events', icon: Calendar, color: 'blue' },
                  { id: 'volunteers', label: 'Volunteers', icon: Users, color: 'purple' },
                  { id: 'attendance', label: 'Attendance', icon: UserCheck, color: 'indigo' },
                  { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'amber' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group flex items-center space-x-3 px-6 py-3 text-sm font-bold rounded-xl transition-all duration-300 flex-shrink-0 ${
                      activeTab === tab.id
                        ? `text-white bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 shadow-lg ring-2 ring-${tab.color}-200`
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    {activeTab === tab.id && (
                      <ChevronRight className="w-4 h-4 animate-pulse" />
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {activeTab === 'dashboard' && renderDashboardTab()}
            {activeTab === 'events' && renderEventsTab()}
            {activeTab === 'volunteers' && renderVolunteersTab()}
            {activeTab === 'attendance' && renderAttendanceTab()}
            {activeTab === 'analytics' && <WasteZeroAnalytics userRole="ngo" />}
          </div>
        </div>
      </div>

      {/* All Modals */}
      <CreateEventModal
        showModal={showCreateEventModal}
        setShowModal={setShowCreateEventModal}
        newEvent={newEvent}
        handleNewEventChange={handleNewEventChange}
        handleCreateEvent={handleCreateEvent}
        loading={loading}
      />

      <ViewEventDetailsModal
        showModal={showViewDetailsModal}
        setShowModal={setShowViewDetailsModal}
        event={selectedEventForDetails}
      />

      <DeleteConfirmationModal
        showModal={showDeleteModal}
        setShowModal={setShowDeleteModal}
        eventToDelete={eventToDelete}
        onConfirm={confirmDeleteEvent}
        loading={loading}
      />

      <ApplicationManagementModal
        showModal={showApplicationModal}
        setShowModal={setShowApplicationModal}
        selectedEvent={selectedEventForApplications}
        applications={applications.filter(app => app.eventId === selectedEventForApplications?.id)}
        onApproveApplication={handleApproveApplication}
        onRejectApplication={handleRejectApplication}
        loading={loading}
      />

      <EditEventModal
        showModal={showEditEventModal}
        setShowModal={setShowEditEventModal}
        editEvent={editEvent}
        handleEditEventChange={handleEditEventChange}
        handleUpdateEvent={handleUpdateEvent}
        loading={loading}
      />

      {showAttendanceModal && selectedEventForAttendance && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl ring-4 ring-emerald-500/20 animate-scaleIn">
            <AttendanceManager
              eventId={selectedEventForAttendance}
              onClose={() => {
                setShowAttendanceModal(false);
                setSelectedEventForAttendance(null);
              }}
            />
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default NGODashboard;
