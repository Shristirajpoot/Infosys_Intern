// components/RecommendedVolunteers.jsx
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MapPin, 
  Star, 
  Award,
  Target,
  Mail,
  Loader,
  UserPlus,
  Eye
} from 'lucide-react';
import { toast } from 'react-toastify';
import { ngoAPI } from '../services/api';

export default function RecommendedVolunteers({ opportunityId, opportunityTitle, loading: parentLoading }) {
  const [matchedVolunteers, setMatchedVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedVolunteer, setExpandedVolunteer] = useState(null);
  const [inviting, setInviting] = useState(null);

  useEffect(() => {
    if (opportunityId) {
      loadMatchedVolunteers();
    }
  }, [opportunityId]);

  const loadMatchedVolunteers = async () => {
    try {
      setLoading(true);
      const response = await ngoAPI.getMatchingVolunteers(opportunityId);
      setMatchedVolunteers(response.data || []);
    } catch (error) {
      console.error('Error loading matched volunteers:', error);
      // Don't show toast error as this is optional feature
    } finally {
      setLoading(false);
    }
  };

  const handleInviteVolunteer = async (volunteerId) => {
    try {
      setInviting(volunteerId);
      await ngoAPI.inviteVolunteer(opportunityId, volunteerId);
      toast.success('Invitation sent successfully!');
      // Optionally refresh the list or mark volunteer as invited
    } catch (error) {
      console.error('Error inviting volunteer:', error);
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    } finally {
      setInviting(null);
    }
  };

  const getMatchScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900/50 dark:text-green-400';
    if (score >= 60) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-400';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-400';
    return 'text-orange-600 bg-orange-100 dark:bg-orange-900/50 dark:text-orange-400';
  };

  const getWasteTypeIcon = (wasteType) => {
    const icons = {
      organic: '🍃',
      plastic: '♻️',
      paper: '📄',
      glass: '🥛',
      metal: '🔧',
      electronic: '💻',
      hazardous: '⚠️',
      textile: '👕',
      construction: '🏗️',
      medical: '🏥'
    };
    return icons[wasteType] || '♻️';
  };

  if (loading || parentLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 dark:border dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
            Recommended Volunteers
          </h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
      </div>
    );
  }

  if (!opportunityId) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 dark:border dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
            Recommended Volunteers
          </h3>
        </div>
        <div className="text-center py-8">
          <Target className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-2">Select an Opportunity</h4>
          <p className="text-gray-500 dark:text-gray-400">
            Choose an opportunity to see volunteer recommendations.
          </p>
        </div>
      </div>
    );
  }

  if (matchedVolunteers.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 dark:border dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
            Recommended Volunteers
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">for {opportunityTitle}</span>
          </h3>
          <button
            onClick={loadMatchedVolunteers}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            Refresh
          </button>
        </div>
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-2">No Matches Found</h4>
          <p className="text-gray-500 dark:text-gray-400">
            No volunteers match the requirements for this opportunity yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 dark:border dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
          <Users className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
          Recommended Volunteers
          <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-full">
            {matchedVolunteers.length} found
          </span>
        </h3>
        <button
          onClick={loadMatchedVolunteers}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {matchedVolunteers.slice(0, 5).map((match) => (
          <div 
            key={match.volunteer._id} 
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">{match.volunteer.name}</h4>
                  <div className={`px-2 py-1 rounded-full text-xs font-bold ${getMatchScoreColor(match.score)}`}>
                    {match.score}% match
                  </div>
                </div>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {match.volunteer.location}
                  </div>
                  <div className="flex items-center">
                    <Award className="h-3 w-3 mr-1" />
                    {match.volunteer.experienceLevel} level
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setExpandedVolunteer(
                    expandedVolunteer === match.volunteer._id ? null : match.volunteer._id
                  )}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="View details"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleInviteVolunteer(match.volunteer._id)}
                  disabled={inviting === match.volunteer._id}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/50 disabled:opacity-50"
                  title="Invite volunteer"
                >
                  {inviting === match.volunteer._id ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Waste Type Preferences */}
            {match.volunteer.wasteTypePreferences && match.volunteer.wasteTypePreferences.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {match.volunteer.wasteTypePreferences.slice(0, 4).map((wasteType, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-2 py-1 text-xs bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded"
                  >
                    {getWasteTypeIcon(wasteType)} {wasteType}
                  </span>
                ))}
                {match.volunteer.wasteTypePreferences.length > 4 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    +{match.volunteer.wasteTypePreferences.length - 4} more
                  </span>
                )}
              </div>
            )}

            {/* Skills */}
            {match.volunteer.skills && match.volunteer.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {match.volunteer.skills.slice(0, 3).map((skill, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                  >
                    {skill}
                  </span>
                ))}
                {match.volunteer.skills.length > 3 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    +{match.volunteer.skills.length - 3} more skills
                  </span>
                )}
              </div>
            )}

            {/* Expanded Details */}
            {expandedVolunteer === match.volunteer._id && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Location Match:</span>
                    <div className="flex items-center mt-1">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${match.matchReasons.location}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-gray-500 dark:text-gray-400">{match.matchReasons.location}%</span>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Waste Types:</span>
                    <div className="flex items-center mt-1">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${match.matchReasons.wasteTypes}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-gray-500 dark:text-gray-400">{match.matchReasons.wasteTypes}%</span>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Skills:</span>
                    <div className="flex items-center mt-1">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: `${match.matchReasons.skills}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-gray-500 dark:text-gray-400">{match.matchReasons.skills}%</span>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Experience:</span>
                    <div className="flex items-center mt-1">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{ width: `${match.matchReasons.experience}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-gray-500 dark:text-gray-400">{match.matchReasons.experience}%</span>
                    </div>
                  </div>
                </div>

                {match.volunteer.bio && (
                  <div className="mb-4">
                    <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">Bio:</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{match.volunteer.bio}</p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleInviteVolunteer(match.volunteer._id)}
                    disabled={inviting === match.volunteer._id}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {inviting === match.volunteer._id ? 'Sending...' : 'Send Invitation'}
                  </button>
                  <button
                    onClick={() => window.open(`mailto:${match.volunteer.email}`, '_blank')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    <Mail className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {matchedVolunteers.length > 5 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing top 5 matches of {matchedVolunteers.length} total
          </p>
        </div>
      )}
    </div>
  );
}
