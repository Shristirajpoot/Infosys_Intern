import React from "react";
import Icon from "../constants/Icons";
// Footer component with links and social media icons
const AppFooter = () => (
    <footer className="p-6 mt-auto bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <div className="flex space-x-6 mb-4 md:mb-0">
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">Product</a>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">Company</a>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">Resources</a>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">Legal</a>
            </div>
            <div className="flex space-x-6">
                <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"><Icon name="Facebook" className="h-5 w-5" /></a>
                <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"><Icon name="Twitter" className="h-5 w-5" /></a>
                <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"><Icon name="Instagram" className="h-5 w-5" /></a>
                <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"><Icon name="Linkedin" className="h-5 w-5" /></a>
            </div>
        </div>
    </footer>
);
export default AppFooter;
