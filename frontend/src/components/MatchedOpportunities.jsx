// components/MatchedOpportunities.jsx
import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Target,
  Loader,
  RefreshCw, // Used for refresh button
  ChevronDown, // Used for expand indicator
  ChevronUp,
  Activity
} from 'lucide-react';
import { volunteerAPI } from '../services/api';

export default function MatchedOpportunities({ onApply, loading: parentLoading }) {
  const [matchedOpportunities, setMatchedOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState(null);

  useEffect(() => {
    loadMatchedOpportunities();
  }, []);

  const loadMatchedOpportunities = async () => {
    try {
      setLoading(true);
      // NOTE: Assuming the API returns an object with a 'data' array
      const response = await volunteerAPI.getMatchingOpportunities(6); 
      setMatchedOpportunities(response.data || []);
    } catch (error) {
      console.error('Error loading matched opportunities:', error);
      // Don't show toast error as this is an optional feature
    } finally {
      setLoading(false);
    }
  };

  const getMatchScoreColor = (score) => {
    if (score >= 80) return 'text-green-800 bg-green-200 dark:bg-green-700 dark:text-green-300'; // High Match
    if (score >= 60) return 'text-blue-800 bg-blue-200 dark:bg-blue-700 dark:text-blue-300';   // Good Match
    if (score >= 40) return 'text-yellow-800 bg-yellow-200 dark:bg-yellow-700 dark:text-yellow-300'; // Medium Match
    return 'text-orange-800 bg-orange-200 dark:bg-orange-700 dark:text-orange-300'; // Low Match
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
    return icons[wasteType] || '📦';
  };

  // --- UPDATED LOADING STATE STYLING ---
  if (loading || parentLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <Target className="h-6 w-6 mr-2 text-green-600 dark:text-green-400" />
            Matched Opportunities
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <Activity className="h-8 w-8 text-green-600 dark:text-green-400 animate-spin mb-3" />
          <span className="ml-2 text-gray-600 dark:text-gray-300 font-medium">Loading your best matches...</span>
        </div>
      </div>
    );
  }

  // --- UPDATED EMPTY STATE STYLING ---
  if (matchedOpportunities.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <Target className="h-6 w-6 mr-2 text-green-600 dark:text-green-400" />
            Matched Opportunities
          </h2>
        </div>
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
          <Target className="h-10 w-10 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Matches Found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
            Update your **Volunteer Preferences** to get personalized opportunity recommendations.
          </p>
          <button
            onClick={() => window.location.hash = '#preferences'}
            className="px-6 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-md"
          >
            Set Preferences Now
          </button>
        </div>
      </div>
    );
  }

  // --- MAIN RENDER (UPDATED STYLING) ---
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-700 pb-3">
        {/* UPDATED: Bolder Header */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
          <Target className="h-6 w-6 mr-2 text-green-600 dark:text-green-400" />
          Matched Opportunities
          <span className="ml-3 px-3 py-1 text-sm font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-full shadow-sm">
            {matchedOpportunities.length} found
          </span>
        </h2>
        {/* UPDATED: Refresh Button Style */}
        <button
          onClick={loadMatchedOpportunities}
          className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh Matches
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {matchedOpportunities.map((match) => (
          <div 
            key={match.opportunity._id} 
            className="bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => setExpandedCard(expandedCard === match.opportunity._id ? null : match.opportunity._id)}
          >
            
            {/* Header and Match Score */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 pr-4">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base mb-1">
                  {match.opportunity.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {match.opportunity.description}
                </p>
              </div>
              {/* UPDATED: Match Score Badge - Larger, more prominent */}
              <div className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-extrabold ${getMatchScoreColor(match.score)} shadow-md`}>
                {match.score}% match
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-red-500" />
                <span className="truncate">{match.opportunity.location}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                {new Date(match.opportunity.date).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-purple-500" />
                {match.opportunity.registeredCount || 0}/{match.opportunity.capacity} volunteers needed
              </div>
            </div>

            {/* Waste Types */}
            <div className="flex flex-wrap gap-2 mb-4">
              {match.opportunity.wasteTypes?.slice(0, 3).map((wasteType, index) => (
                <span 
                  key={index}
                  // UPDATED: Pill style for waste types
                  className="inline-flex items-center px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-full border border-blue-300 dark:border-blue-700"
                >
                  {getWasteTypeIcon(wasteType)} {wasteType}
                </span>
              ))}
              {match.opportunity.wasteTypes?.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 px-3 py-1">
                  +{match.opportunity.wasteTypes.length - 3} more
                </span>
              )}
            </div>

            {/* Expanded Details */}
            {expandedCard === match.opportunity._id && (
              <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                <h4 className='text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3'>Match Breakdown:</h4>
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  {/* Progress Bars for Match Reasons */}
                  {Object.entries(match.matchReasons || {}).map(([reason, value]) => (
                    <div key={reason}>
                      <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">{reason.replace(/([A-Z])/g, ' $1')}:</span>
                      <div className="flex items-center mt-1">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            // Dynamically setting color for progress bar based on score
                            className={`h-2 rounded-full ${
                                reason === 'location' ? 'bg-red-500' :
                                reason === 'wasteTypes' ? 'bg-blue-500' :
                                reason === 'skills' ? 'bg-purple-500' :
                                'bg-orange-500'
                            }`}
                            style={{ width: `${value}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-gray-600 dark:text-gray-400 font-semibold text-xs">{value}%</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Apply Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onApply(match.opportunity._id);
                  }}
                  disabled={match.opportunity.status !== 'active' || match.opportunity.isFull}
                  // UPDATED: Primary solid green button style
                  className="w-full mt-2 px-4 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-500/50 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
                >
                  {match.opportunity.isFull ? 'Opportunity Full' : 'Apply Now'}
                </button>
              </div>
            )}
            
            {/* Quick Apply Button/Expand Indicator for collapsed state */}
            {expandedCard !== match.opportunity._id && (
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onApply(match.opportunity._id);
                  }}
                  disabled={match.opportunity.status !== 'active' || match.opportunity.isFull}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {match.opportunity.isFull ? 'Full' : 'Quick Apply'}
                </button>
                <div className='flex items-center text-sm text-gray-500 dark:text-gray-400'>
                    View Details
                    <ChevronDown className="h-4 w-4 ml-1" />
                </div>
              </div>
            )}
            {expandedCard === match.opportunity._id && (
                <div className='mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center'>
                    Hide Details
                    <ChevronUp className="h-4 w-4 ml-1" />
                </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        {/* UPDATED: Consistent link style */}
        <button
          onClick={() => window.location.hash = '#opportunities'}
          className="text-base font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
        >
          View All Opportunities →
        </button>
      </div>
    </div>
  );
}
