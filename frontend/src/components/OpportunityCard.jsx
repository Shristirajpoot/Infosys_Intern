import React from "react";
import Icon from "../constants/Icons";
// Destructuring Lucide icons for better clarity and consistency
import { Calendar, MapPin, Users, Target, Star } from "lucide-react"; 

// Reusable OpportunityCard component to display individual opportunities
const OpportunityCard = ({ opportunity }) => {
    // Note: Assuming `LocationEditIcon` from the original code should be `MapPin` for location
    const { 
        title, 
        description, 
        status, 
        category, 
        location, 
        date, 
        participants, 
        capacity,
        isMatched // Assuming this prop might be available from the dashboard context
    } = opportunity;
    
    // Safety check for calculated values
    const isFull = participants >= capacity;
    const progress = capacity > 0 ? (participants / capacity) * 100 : 0;

    // Updated status classes for modern, clean look
    const statusClasses = {
        Active: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400',
        Full: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400', // Use red for 'Full' as it denotes unavailability
        Inactive: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
        // Assuming 'Pending' status could also exist
        Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400',
    };

    // Determine the base styling for the card, highlighting matched opportunities
    const baseCardClasses = `
        bg-white dark:bg-gray-800 rounded-xl p-6 flex flex-col gap-4 
        shadow-xl transition-all duration-300 transform hover:shadow-2xl hover:scale-[1.01] 
        ${isMatched 
            ? 'border-2 border-green-500 ring-2 ring-green-200 dark:border-green-600 dark:ring-green-900' 
            : 'border border-gray-200 dark:border-gray-700'
        }
    `;

    return (
        <div className={baseCardClasses}>
            
            {/* Match Badge (if applicable) */}
            {isMatched && (
                <div className="flex items-center text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
                    <Star className="h-4 w-4 mr-2 fill-green-400 text-green-600" />
                    RECOMMENDED MATCH
                </div>
            )}

            {/* Card Header & Status */}
            <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                <div className="flex flex-col gap-2">
                    {/* Icon/Image Placeholder - using a clean div instead of assuming local 'leaf.png' is available */}
                    <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                        <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${statusClasses[status] || statusClasses.Inactive}`}>
                        {status || 'N/A'}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full font-medium">
                        {category}
                    </span>
                </div>
            </div>

            {/* Card Body */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2 line-clamp-3">{description}</p>
            </div>

            {/* Card Details */}
            <div className="space-y-3 text-sm font-medium text-gray-700 dark:text-gray-300 pt-2 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span className="truncate">{location}</span>
                </div>
                <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span>{new Date(date).toLocaleDateString()}</span>
                </div>
            </div>
            
            {/* Card Footer / Progress */}
            <div className="flex flex-col gap-3 mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300 font-semibold">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-yellow-500" />
                        <span>Volunteers: {participants}/{capacity}</span>
                    </div>
                    <span>{Math.round(progress)}% Full</span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                        className={`rounded-full h-2.5 transition-all duration-500 ${isFull 
                            ? 'bg-red-500' // Red for full/unavailable
                            : 'bg-gradient-to-r from-green-400 to-green-600 dark:from-green-500 dark:to-green-700'}` // Vibrant green gradient
                        }
                        style={{ width: `${progress > 100 ? 100 : progress}%` }}
                    ></div>
                </div>

                {/* Action Button */}
                <button 
                    className={`mt-4 w-full py-3 px-4 text-white font-bold rounded-xl shadow-lg transition-all duration-300 
                        ${isFull 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-500/50'
                        }`
                    }
                    disabled={isFull}
                >
                    {isFull ? 'Capacity Reached' : 'Apply Now'}
                </button>
            </div>
        </div>
    );
};


// --- Main App Component ---
// This is the main component that renders the entire page.
export default function App() {
    // Note: The App component below is provided for context and uses the new OpportunityCard styling.
    
    // Mock data check (replace with actual data source logic)
    const mockOpportunitiesData = [
        { 
            id: 1, 
            title: "Riverside Cleanup Drive", 
            description: "Join us to remove plastic and debris from the local riverbank.", 
            status: "Active", 
            category: "Environmental", 
            location: "North River Park, Sector 4", 
            date: "2025-11-15", 
            participants: 12, 
            capacity: 20,
            isMatched: true // Example match
        },
        { 
            id: 2, 
            title: "Community Garden Planting", 
            description: "Help plant new seedlings for the city's urban garden project.", 
            status: "Full", 
            category: "Community", 
            location: "Central City Gardens", 
            date: "2025-11-20", 
            participants: 30, 
            capacity: 30,
            isMatched: false
        },
        { 
            id: 3, 
            title: "Waste Sorting Workshop", 
            description: "An educational session on effective recycling and composting.", 
            status: "Active", 
            category: "Education", 
            location: "Main Library, Room B", 
            date: "2025-12-01", 
            participants: 5, 
            capacity: 15,
            isMatched: true
        }
    ];

    return (
        <div className="bg-gray-50 dark:bg-gray-900 font-sans min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                {/* Page Header */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 border-b pb-4 border-gray-200 dark:border-gray-800">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Suggested Opportunities</h3>
                        <p className="text-md text-gray-600 dark:text-gray-400">Find new ways to make an impact based on your profile preferences.</p>
                    </div>
                </header>

                {/* Opportunities Grid */}
                <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {(opportunitiesData || mockOpportunitiesData).map((opp) => (
                        <OpportunityCard key={opp.id} opportunity={opp} />
                    ))}
                </main>
            </div>
        </div>
    );
}
