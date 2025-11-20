import React from 'react';
import { Calendar, MapPin, Activity, ListChecks, ChevronRight } from 'lucide-react';

// Component to display upcoming events the volunteer has been accepted to
const UpcomingEvents = ({ upcomingEvents = [], loading = false, onViewAllEvents }) => {

    // --- UPDATED LOADING STATE STYLING ---
    if (loading) {
        return (
            // Enhanced card container styling
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 h-fit">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 flex items-center">
                    <ListChecks className="h-6 w-6 mr-2 text-green-600 dark:text-green-400" />
                    Upcoming Events
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Events you're registered for.</p>
                <div className="flex flex-col items-center justify-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Activity className="h-8 w-8 text-green-600 dark:text-green-400 animate-spin mb-3" />
                    <span className="ml-2 text-gray-600 dark:text-gray-300 font-medium">Loading events...</span>
                </div>
            </div>
        );
    }

    // --- MAIN RENDER (UPDATED STYLING) ---
    return (
        // Enhanced card container styling
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 h-fit">
            
            {/* Enhanced Header Styling */}
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 flex items-center">
                <ListChecks className="h-6 w-6 mr-2 text-green-600 dark:text-green-400" />
                Upcoming Events
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Events you're registered for and attending.</p>
            
            <div className="space-y-4 min-h-[200px]">
                {upcomingEvents.length > 0 ? (
                    upcomingEvents.slice(0, 3).map((event) => (
                        <div 
                            key={event._id || event.id} 
                            // Stronger list item style with shadow and hover
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                        >
                            <div className="flex-1 min-w-0 pr-4">
                                <p className="font-semibold text-lg text-gray-900 dark:text-gray-100 truncate">{event.title || event.name}</p>
                                <div className="flex flex-col gap-1 mt-1">
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <Calendar className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
                                        <span className="font-medium">{new Date(event.date).toLocaleDateString()}</span>
                                    </div>
                                    {event.location && (
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                            <MapPin className="h-4 w-4 mr-2 text-red-500 flex-shrink-0" />
                                            <span className="truncate">{event.location}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex items-center flex-shrink-0">
                                <span className="text-xs font-bold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/40 px-3 py-1.5 rounded-full shadow-sm">
                                    REGISTERED
                                </span>
                                <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500 ml-2" />
                            </div>
                        </div>
                    ))
                ) : (
                    // Empty state styling adjusted for better visibility
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                        <Calendar className="h-10 w-10 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                        <p className="text-gray-600 dark:text-gray-300 font-medium text-base">You have no upcoming events.</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Start applying to opportunities to join events!</p>
                    </div>
                )}
            </div>
            
            {/* Updated Button to solid green for primary action consistency */}
            <button 
                onClick={onViewAllEvents}
                className="mt-6 w-full py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 transition-colors focus:ring-4 focus:ring-green-500/50"
            >
                View All Events
            </button>
        </div>
    );
};

export default UpcomingEvents;
