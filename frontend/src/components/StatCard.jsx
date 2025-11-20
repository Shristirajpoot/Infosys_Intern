import React from 'react';
import { TrendingUp } from 'lucide-react';
import Icon from '../constants/Icons'; 

// Utility function to get dynamic colors based on the color prop
const getColorClasses = (color) => {
    switch (color) {
        case 'green':
            return {
                bg: 'bg-green-100 dark:bg-green-900/40',
                text: 'text-green-600 dark:text-green-400',
                ring: 'ring-green-500/50'
            };
        case 'blue':
            return {
                bg: 'bg-blue-100 dark:bg-blue-900/40',
                text: 'text-blue-600 dark:text-blue-400',
                ring: 'ring-blue-500/50'
            };
        case 'purple':
            return {
                bg: 'bg-purple-100 dark:bg-purple-900/40',
                text: 'text-purple-600 dark:text-purple-400',
                ring: 'ring-purple-500/50'
            };
        case 'orange':
            return {
                bg: 'bg-orange-100 dark:bg-orange-900/40',
                text: 'text-orange-600 dark:text-orange-400',
                ring: 'ring-orange-500/50'
            };
        default:
            return {
                bg: 'bg-gray-100 dark:bg-gray-700/40',
                text: 'text-gray-600 dark:text-gray-400',
                ring: 'ring-gray-500/50'
            };
    }
};

// Reusable StatCard component to display individual statistics
const StatCard = ({ stat }) => {
    const { bg, text, ring } = getColorClasses(stat.color);
    
    // Determine the color for the change value (e.g., +12% should be green)
    const changeValue = stat.change || '';
    const changeColor = changeValue.startsWith('+') 
        ? 'text-green-500 dark:text-green-400' 
        : changeValue.startsWith('-') 
        ? 'text-red-500 dark:text-red-400' 
        : 'text-gray-500 dark:text-gray-400';

    return (
        <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-all duration-300 hover:shadow-xl hover:ring-2 ${ring}`}>
            <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.label}</p>
                <div className="flex items-baseline space-x-2">
                    <p className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">{stat.value}</p>
                    {stat.change && (
                        <span className={`text-xs font-semibold ${changeColor} flex items-center`}>
                            {/* Assuming '+' or '-' is part of the change string */}
                            {stat.change}
                            <TrendingUp className={`w-3 h-3 ml-1 ${changeColor} ${changeValue.startsWith('-') ? 'rotate-180' : ''}`} />
                        </span>
                    )}
                </div>
                {stat.period && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">{stat.period}</p>
                )}
            </div>
            {/* Dynamic Icon Styling */}
            <div className={`p-4 rounded-full ${bg} transition-colors duration-200`}>
                <stat.icon className={`h-8 w-8 ${text}`} />
            </div>
        </div>
    );
};

export default StatCard;
