// components/VolunteerPreferences.jsx
import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Clock, 
  Star,
  Save,
  Settings,
  Target,
  Award,
  Navigation,
  Trash2,
  CheckCircle, // Added for confirmed status visual
  Gauge, // Better icon for distance/range
} from 'lucide-react';
import { toast } from 'react-toastify';
import { volunteerAPI } from '../services/api';

export default function VolunteerPreferences({ user, onUpdate }) {
  const [preferences, setPreferences] = useState({
    coordinates: {
      latitude: null,
      longitude: null
    },
    wasteTypePreferences: [],
    availability: {
      days: [],
      timePreference: 'flexible'
    },
    maxTravelDistance: 10,
    experienceLevel: 'beginner',
    skills: []
  });
  const [loading, setLoading] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);

  // Data arrays (kept as is)
  const wasteTypes = [
    { value: 'organic', label: 'Organic Waste', icon: '🍃' },
    { value: 'plastic', label: 'Plastic', icon: '♻️' },
    { value: 'paper', label: 'Paper', icon: '📄' },
    { value: 'glass', label: 'Glass', icon: '🥛' },
    { value: 'metal', label: 'Metal', icon: '🔧' },
    { value: 'electronic', label: 'Electronic', icon: '💻' },
    { value: 'hazardous', label: 'Hazardous', icon: '⚠️' },
    { value: 'textile', label: 'Textile', icon: '👕' },
    { value: 'construction', label: 'Construction', icon: '🏗️' },
    { value: 'medical', label: 'Medical', icon: '🏥' }
  ];

  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  const timePreferences = [
    { value: 'morning', label: 'Morning (6 AM - 12 PM)' },
    { value: 'afternoon', label: 'Afternoon (12 PM - 6 PM)' },
    { value: 'evening', label: 'Evening (6 PM - 10 PM)' },
    { value: 'flexible', label: 'Flexible (Any time)' }
  ];

  const experienceLevels = [
    { value: 'beginner', label: 'Beginner', description: 'New to volunteering' },
    { value: 'intermediate', label: 'Intermediate', description: 'Some volunteer experience' },
    { value: 'advanced', label: 'Advanced', description: 'Experienced volunteer' }
  ];
  // End Data arrays

  useEffect(() => {
    // Load current preferences from user data
    if (user) {
      setPreferences({
        coordinates: user.coordinates || { latitude: null, longitude: null },
        wasteTypePreferences: user.wasteTypePreferences || [],
        availability: user.availability || { days: [], timePreference: 'flexible' },
        maxTravelDistance: user.maxTravelDistance || 10,
        experienceLevel: user.experienceLevel || 'beginner',
        skills: user.skills || []
      });
    }
  }, [user]);

  // --- Handlers (kept the same, they are pure logic) ---
  const handleWasteTypeToggle = (wasteType) => {
    setPreferences(prev => ({
      ...prev,
      wasteTypePreferences: prev.wasteTypePreferences.includes(wasteType)
        ? prev.wasteTypePreferences.filter(type => type !== wasteType)
        : [...prev.wasteTypePreferences, wasteType]
    }));
  };

  const handleDayToggle = (day) => {
    setPreferences(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        days: prev.availability.days.includes(day)
          ? prev.availability.days.filter(d => d !== day)
          : [...prev.availability.days, day]
      }
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !preferences.skills.includes(newSkill.trim())) {
      setPreferences(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setPreferences(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPreferences(prev => ({
          ...prev,
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
        }));
        toast.success('Location updated successfully');
        setLocationLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Failed to get location. Please check your browser permissions.');
        setPreferences(prev => ({ 
            ...prev, 
            coordinates: { latitude: null, longitude: null } // Clear location on failure
        }));
        setLocationLoading(false);
      },
      { timeout: 10000 }
    );
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // NOTE: Ensure volunteerAPI.updatePreferences is correctly implemented in '../services/api'
      await volunteerAPI.updatePreferences(preferences); 
      toast.success('Preferences updated successfully!');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error(error.response?.data?.message || 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };
  // --- End Handlers ---

  const locationIsSet = preferences.coordinates.latitude && preferences.coordinates.longitude;

  return (
    // UPDATED: Use shadow-xl and border for a stronger card look
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-6 mb-8">
        {/* UPDATED: Larger, bolder heading */}
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center mb-3 sm:mb-0">
          <Settings className="h-6 w-6 mr-3 text-green-600 dark:text-green-400" />
          Volunteer Preferences
        </h2>
        
        {/* Save Button Styling is good, just adding shadow for consistency */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2.5 text-base font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500/50 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>

      <div className="space-y-10">
        
        {/* Location Section */}
        <div>
          {/* UPDATED: Bolder Section Header */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-200 mb-6 flex items-center pb-1 border-b border-dashed border-gray-200 dark:border-gray-700">
            <MapPin className="h-5 w-5 mr-3 text-blue-600 dark:text-blue-400" />
            Location & Travel Range
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Base Location
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  // UPDATED: Use primary blue button style
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center transition-colors"
                >
                  <Navigation className={`h-4 w-4 mr-2 ${locationLoading ? 'animate-spin' : ''}`} />
                  {locationLoading ? 'Locating...' : 'Use Current Location'}
                </button>
                {locationIsSet ? (
                  <span className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-1" />
                    Location set ({preferences.coordinates.latitude.toFixed(4)}, {preferences.coordinates.longitude.toFixed(4)})
                  </span>
                ) : (
                    <span className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center">
                        <MapPin className="h-5 w-5 mr-1" />
                        Location not set
                    </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Maximum Travel Distance: <span className="font-bold text-lg text-green-600 dark:text-green-400">{preferences.maxTravelDistance} km</span>
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={preferences.maxTravelDistance}
                onChange={(e) => setPreferences(prev => ({ ...prev, maxTravelDistance: parseInt(e.target.value) }))}
                // UPDATED: Use green theme for the slider track
                className="w-full h-2 bg-green-200 dark:bg-green-900/50 rounded-lg appearance-none cursor-pointer range-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                style={{
                    '--thumb-color': preferences.maxTravelDistance > 50 ? '#009966' : '#22c55e', // Subtle thumb color change
                    '--track-color': '#d1fae5', 
                    '--track-fill-color': '#10b981'
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                <span>1 km (Local)</span>
                <span className="font-semibold">50 km (Regional)</span>
                <span>100 km (Max)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Waste Type Preferences */}
        <div>
          {/* UPDATED: Bolder Section Header */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-200 mb-6 flex items-center pb-1 border-b border-dashed border-gray-200 dark:border-gray-700">
            <Target className="h-5 w-5 mr-3 text-green-600 dark:text-green-400" />
            Waste Type Preferences
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Select the types of waste management activities you're interested in:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {wasteTypes.map((wasteType) => (
              <button
                key={wasteType.value}
                onClick={() => handleWasteTypeToggle(wasteType.value)}
                // UPDATED: Stronger border and hover styles
                className={`p-4 rounded-xl border-2 text-center transition-all duration-200 transform hover:scale-[1.03] ${
                  preferences.wasteTypePreferences.includes(wasteType.value)
                    ? 'border-green-600 bg-green-50 dark:bg-green-900/60 text-green-700 dark:text-green-300 shadow-md'
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-green-500 dark:hover:border-green-500 dark:text-gray-300'
                }`}
              >
                <div className="text-3xl mb-1">{wasteType.icon}</div>
                <div className="text-sm font-semibold">{wasteType.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div>
          {/* UPDATED: Bolder Section Header */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-200 mb-6 flex items-center pb-1 border-b border-dashed border-gray-200 dark:border-gray-700">
            <Clock className="h-5 w-5 mr-3 text-purple-600 dark:text-purple-400" />
            Availability
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Available Days
              </label>
              <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day.value}
                    onClick={() => handleDayToggle(day.value)}
                    // UPDATED: Enhanced button styles
                    className={`p-3 text-sm font-semibold rounded-lg border-2 transition-all duration-150 ${
                      preferences.availability.days.includes(day.value)
                        ? 'border-purple-600 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 shadow-sm'
                        : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500 dark:text-gray-300 bg-gray-50 dark:bg-gray-700'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preferred Time Slot
              </label>
              <select
                value={preferences.availability.timePreference}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  availability: { ...prev.availability, timePreference: e.target.value }
                }))}
                // UPDATED: Consistent input focus style
                className="w-full px-4 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              >
                {timePreferences.map((time) => (
                  <option key={time.value} value={time.value}>
                    {time.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Experience Level */}
        <div>
          {/* UPDATED: Bolder Section Header */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-200 mb-6 flex items-center pb-1 border-b border-dashed border-gray-200 dark:border-gray-700">
            <Award className="h-5 w-5 mr-3 text-orange-600 dark:text-orange-400" />
            Experience Level
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {experienceLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => setPreferences(prev => ({ ...prev, experienceLevel: level.value }))}
                // UPDATED: Enhanced button styles
                className={`p-5 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md ${
                  preferences.experienceLevel === level.value
                    ? 'border-orange-600 bg-orange-50 dark:bg-orange-900/60 shadow-lg'
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-orange-300 dark:hover:border-orange-500'
                }`}
              >
                <div className="font-bold text-lg text-gray-900 dark:text-gray-100">{level.label}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{level.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div>
          {/* UPDATED: Bolder Section Header */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-200 mb-6 flex items-center pb-1 border-b border-dashed border-gray-200 dark:border-gray-700">
            <Star className="h-5 w-5 mr-3 text-yellow-600 dark:text-yellow-400" />
            Skills & Interests
          </h3>
          
          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                placeholder="Add a skill or interest (e.g., driving, first aid, translation)..."
                // UPDATED: Consistent input focus style
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors"
              />
              <button
                onClick={handleAddSkill}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                disabled={!newSkill.trim()}
              >
                Add
              </button>
            </div>

            {preferences.skills.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
                {preferences.skills.map((skill, index) => (
                  <span
                    key={index}
                    // UPDATED: Enhanced pill style
                    className="inline-flex items-center px-3 py-1 text-sm font-medium bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full border border-green-300 dark:border-green-700 shadow-sm"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-2 text-green-600 dark:text-green-400 hover:text-red-500 dark:hover:text-red-400 p-0.5 rounded-full hover:bg-white/50 dark:hover:bg-black/50 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            {preferences.skills.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    No skills added yet. Adding skills helps us match you with specialized opportunities!
                </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
