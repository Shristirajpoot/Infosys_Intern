import React, { useState, useEffect, useRef } from "react";
import { Send, Search, MessageSquare, Users, Moon, Sun } from 'lucide-react';
import io from 'socket.io-client';
import { messageAPI } from '../services/api'; // 👈 Import the new API service

// Helper function to truncate the last message
const truncateMessage = (message = "", wordLimit = 11) => {
    const words = message.split(" ");
    if (words.length > wordLimit) {
        return words.slice(0, wordLimit).join(" ") + "...";
    }
    return message;
};

// Helper function to get role badge color (with dark mode support)
const getRoleBadgeColor = (role) => {
    switch (role) {
        case 'ngo':
            return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
        case 'volunteer':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
        case 'admin':
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
};

// Helper function to format role for display
const formatRole = (role) => {
    switch (role) {
        case 'ngo':
            return 'NGO';
        case 'volunteer':
            return 'Volunteer';
        case 'admin':
            return 'Admin';
        default:
            return role;
    }
};

export default function MessagePage() {
    const [currentUser, setCurrentUser] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState("");
    const [search, setSearch] = useState("");
    const [socket, setSocket] = useState(null);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState({});
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // // --- Dark Mode Logic ---
    // const toggleTheme = () => {
    //     const newTheme = theme === 'light' ? 'dark' : 'light';
    //     setTheme(newTheme);
    //     localStorage.setItem('theme', newTheme);
    // };

    // useEffect(() => {
    //     if (theme === 'dark') {
    //         document.documentElement.classList.add('dark');
    //     } else {
    //         document.documentElement.classList.remove('dark');
    //     }
    // }, [theme]);
    // // --- End Dark Mode Logic ---


    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (user) {
            setCurrentUser(user);
        }

        // Cleanup typing timeout on unmount
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    
    useEffect(() => {
        if (search.trim() === "") {
            setFilteredUsers(allUsers);
        } else {
            setFilteredUsers(
                allUsers.filter(user => 
                    user.name.toLowerCase().includes(search.toLowerCase())
                )
            );
        }
    }, [search, allUsers]);

    useEffect(() => {
        if (currentUser) {
            const newSocket = io("http://localhost:4000", {
                query: { userId: currentUser._id },
            });
            setSocket(newSocket);

            newSocket.on("newMessage", (newMessage) => {
                if (selectedUser?._id === newMessage.senderId) {
                    setMessages((prevMessages) => [...prevMessages, newMessage]);
                } else {
                    setUnreadCounts(prev => ({
                        ...prev,
                        [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
                    }));
                    const updateUserList = (list) => list.map(u => 
                        u._id === newMessage.senderId 
                        ? { ...u, lastMessage: { message: newMessage.message, createdAt: newMessage.createdAt } } 
                        : u
                    );
                    setAllUsers(prevUsers => updateUserList(prevUsers));
                }
            });

            // Listen for online users
            newSocket.on("getOnlineUsers", (users) => {
                setOnlineUsers(users);
            });

            // Listen for typing events
            newSocket.on("userTyping", (data) => {
                setTypingUsers(prev => ({
                    ...prev,
                    [data.senderId]: data.isTyping
                }));
            });

            return () => newSocket.close();
        }
    }, [currentUser, selectedUser]);

    useEffect(() => {
        if (!currentUser) return;
        
        const getUsers = async () => {
            try {
                // 👇 Use the imported API service
                const users = await messageAPI.fetchAllUsers();
                const filtered = users.filter(u => u._id !== currentUser._id);
                setAllUsers(filtered);
                
                const initialUnread = {};
                filtered.forEach(u => {
                    if (u.unreadCount > 0) {
                        initialUnread[u._id] = u.unreadCount;
                    }
                });
                setUnreadCounts(initialUnread);

            } catch (err) {
                console.error("Error fetching users:", err);
            }
        };
        getUsers();
    }, [currentUser]);

    useEffect(() => {
        if (!selectedUser?._id || !currentUser?._id) return;
        
        const getMessages = async () => {
            try {
                // 👇 Use the imported API service
                const data = await messageAPI.fetchMessages(selectedUser._id);
                setMessages(data);
            } catch (err) {
                console.error("Error loading messages:", err);
                
                // Handle role-based restrictions
                if (err.response?.status === 403) {
                    setMessages([]);
                    alert("You cannot view messages with this user type.");
                }
            }
        };
        getMessages();
    }, [selectedUser, currentUser]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMsg.trim() || !selectedUser?._id) return;

        try {
            // 👇 Use the imported API service
            const sentMessage = await messageAPI.postMessage(selectedUser._id, newMsg);
            setMessages((prev) => [...prev, sentMessage]);
            const updateUserList = (list) => list.map(u => 
                u._id === selectedUser._id 
                ? { ...u, lastMessage: { message: newMsg, createdAt: Date.now() } } 
                : u
            );
            setAllUsers(prevUsers => updateUserList(prevUsers));
            setNewMsg("");
        } catch (err) {
            console.error("Error sending message:", err);
            
            // Show user-friendly error for role restrictions
            if (err.response?.status === 403) {
                alert("You cannot send messages to this user type. Only NGOs and Volunteers can communicate with each other.");
            } else {
                alert("Failed to send message. Please try again.");
            }
        }
    };

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        if (unreadCounts[user._id]) {
            setUnreadCounts(prev => {
                const newCounts = { ...prev };
                delete newCounts[user._id];
                return newCounts;
            });
        }
    };

    const handleTyping = (value) => {
        setNewMsg(value);
        
        if (socket && selectedUser?._id) {
            // Send typing indicator
            socket.emit("typing", {
                senderId: currentUser._id,
                receiverId: selectedUser._id,
                isTyping: value.length > 0
            });

            // Clear typing after user stops typing
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit("typing", {
                    senderId: currentUser._id,
                    receiverId: selectedUser._id,
                    isTyping: false
                });
            }, 1000);
        }
    };

    return (
        <main className="bg-white dark:bg-gray-900 font-sans flex flex-col h-[calc(100vh-4rem)]">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-gray-800 dark:to-gray-800/50">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <MessageSquare className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                            Messages
                        </h1>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {currentUser?.role === 'ngo' && "Connect with volunteers and coordinate environmental initiatives"}
                            {currentUser?.role === 'volunteer' && "Chat with NGOs about available opportunities"}
                            {currentUser?.role === 'admin' && "Communicate with all platform users"}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                         {/* <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-gray-700">
                           {theme === 'light' ? <Moon className="w-5 h-5 text-slate-600" /> : <Sun className="w-5 h-5 text-yellow-400" />}
                         </button> */}
                        {currentUser && (
                             <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(currentUser.role)}`}>
                                    {formatRole(currentUser.role)}
                                </span>
                                <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                                    <Users className="w-4 h-4" />
                                    <span>{allUsers.length} contacts</span>
                                </div>
                             </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex-grow flex overflow-hidden">
                {/* Left Sidebar */}
                <div className="w-1/3 max-w-sm border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-gray-800/50">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full p-2 pl-10 border border-slate-300 dark:border-slate-600 rounded-full bg-white dark:bg-gray-700 dark:text-slate-100 dark:placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-shadow"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {filteredUsers.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                <Users className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                                <p className="text-sm">No contacts available</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    {currentUser?.role === 'ngo' && "Volunteers will appear here when they join"}
                                    {currentUser?.role === 'volunteer' && "NGOs will appear here when they create events"}
                                    {currentUser?.role === 'admin' && "All users will appear here"}
                                </p>
                            </div>
                        ) : (
                            filteredUsers.map((user) => (
                                <div
                                    key={user._id}
                                    className={`flex items-center p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-gray-700/50 border-b border-slate-100 dark:border-slate-800 transition-colors ${selectedUser?._id === user._id ? 'bg-teal-50 dark:bg-teal-900/50 border-l-4 border-teal-500 dark:border-teal-400' : ''}`}
                                    onClick={() => handleUserSelect(user)}
                                >
                                    <div className="relative mr-3">
                                        <div className="w-11 h-11 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-300 flex items-center justify-center flex-shrink-0 font-semibold text-lg">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        {/* Online status indicator */}
                                        {onlineUsers.includes(user._id) && (
                                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                                        )}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className={`font-semibold truncate ${selectedUser?._id === user._id ? 'text-teal-700 dark:text-teal-300' : 'text-slate-800 dark:text-slate-200'}`}>
                                                {user.name}
                                            </h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                                {formatRole(user.role)}
                                            </span>
                                             {onlineUsers.includes(user._id) && (
                                            <span className="text-xs text-green-600 font-medium">Online</span>
                                        )}
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                            {user.lastMessage 
                                                ? truncateMessage(user.lastMessage.message) 
                                                : "Start a conversation"
                                            }
                                        </p>
                                    </div>
                                    {unreadCounts[user._id] && (
                                        <div className="ml-2 min-w-[20px] h-5 bg-teal-500 rounded-full flex-shrink-0 flex items-center justify-center" title={`${unreadCounts[user._id]} unread message(s)`}>
                                            <span className="text-xs text-white px-1">
                                                {unreadCounts[user._id] > 9 ? '9+' : unreadCounts[user._id]}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Chat Window */}
                <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
                    {selectedUser ? (
                        <>
                            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-gray-800 shadow-sm">
                                <div className="flex items-center">
                                    <div className="relative mr-3">
                                        <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-300 flex items-center justify-center font-semibold text-lg">
                                            {selectedUser.name.charAt(0).toUpperCase()}
                                        </div>
                                        {onlineUsers.includes(selectedUser._id) && (
                                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">{selectedUser.name}</h3>
                                            {onlineUsers.includes(selectedUser._id) && (
                                                <span className="text-xs text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/50 px-2 py-1 rounded-full">
                                                    Online
                                                </span>
                                            )}
                                        </div>
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(selectedUser.role)}`}>
                                            {formatRole(selectedUser.role)}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                    {currentUser?.role === 'ngo' && selectedUser.role === 'volunteer' && "🌱 Environmental Volunteer"}
                                    {currentUser?.role === 'volunteer' && selectedUser.role === 'ngo' && "🌍 Environmental Organization"}
                                    {selectedUser.role === 'admin' && "👨‍💼 Platform Administrator"}
                                </div>
                            </div>
                            <div className="flex-1 p-6 overflow-y-auto bg-slate-50 dark:bg-gray-900/80">
                                {messages.map((m) => (
                                    <div key={m._id} className={`flex mb-4 ${m.senderId === currentUser._id ? "justify-end" : "justify-start"}`}>
                                        <div className={`max-w-lg p-3 rounded-xl shadow-sm ${m.senderId === currentUser._id ? 'bg-teal-500 text-white' : 'bg-white dark:bg-gray-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'}`}>
                                            <p className="text-sm">{m.message}</p>
                                            <span className={`text-xs mt-1.5 block text-right ${m.senderId === currentUser._id ? 'text-teal-100' : 'text-slate-400 dark:text-slate-500'}`}>
                                                {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                
                                {/* Typing indicator */}
                                {typingUsers[selectedUser._id] && (
                                    <div className="flex justify-start mb-4">
                                        <div className="bg-white dark:bg-gray-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-sm max-w-lg">
                                            <div className="flex items-center space-x-1">
                                                <div className="flex space-x-1">
                                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                                </div>
                                                <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">{selectedUser.name} is typing...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-gray-800">
                                <form onSubmit={sendMessage} className="flex items-center space-x-3">
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        value={newMsg}
                                        onChange={(e) => handleTyping(e.target.value)}
                                        className="flex-1 w-full px-4 py-2 bg-white dark:bg-gray-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all dark:placeholder-slate-400"
                                    />
                                    <button 
                                        type="submit" 
                                        className="bg-teal-500 text-white p-2.5 rounded-full hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition-colors flex items-center justify-center" 
                                        disabled={!newMsg.trim()}
                                    >
                                        <Send size={20} />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400 text-center p-4 bg-gradient-to-br from-slate-50 to-teal-50 dark:from-gray-900/80 dark:to-teal-900/20">
                            <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/50 rounded-full flex items-center justify-center mb-4">
                                <MessageSquare size={32} className="text-teal-600 dark:text-teal-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">Select a conversation</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                {currentUser?.role === 'ngo' && "Choose a volunteer to discuss opportunities and coordinate activities"}
                                {currentUser?.role === 'volunteer' && "Select an NGO to learn about environmental initiatives"}
                                {currentUser?.role === 'admin' && "Choose any user to start a conversation"}
                            </p>
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                                <p className="text-xs text-slate-400 dark:text-slate-500">
                                    💬 Real-time messaging • 🔒 Secure communication • 🌱 Building sustainable communities
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
