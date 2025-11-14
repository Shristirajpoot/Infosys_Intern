const Conversation = require("../models/conversation.model.js");
const Message = require("../models/message.model.js");
const User = require("../models/user.model.js");
const { getReceiverSocketId, io } = require("../socket/socket.js");

// Helper function to check if two users can communicate
const canCommunicate = (senderRole, receiverRole) => {
    const allowedCommunications = {
        'ngo': ['volunteer', 'admin'],
        'volunteer': ['ngo', 'admin'],
        'admin': ['volunteer', 'ngo', 'admin']
    };
    
    return allowedCommunications[senderRole]?.includes(receiverRole) || false;
};

// --- SEND MESSAGE (Enhanced with role-based validation) ---
const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;
        const senderRole = req.user.role;

        // Get receiver's role for validation
        const receiver = await User.findById(receiverId).select('role');
        if (!receiver) {
            return res.status(404).json({ error: "Receiver not found" });
        }

        // Check if communication is allowed between these roles
        if (!canCommunicate(senderRole, receiver.role)) {
            return res.status(403).json({ 
                error: "Communication not allowed between these user types" 
            });
        }

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
            });
        }

        const newMessage = new Message({ senderId, receiverId, message });

        if (newMessage) {
            conversation.messages.push(newMessage._id);
        }

        await Promise.all([conversation.save(), newMessage.save()]);

        // SOCKET.IO LOGIC
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error)
    {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};


// --- GET MESSAGES (Enhanced with role-based validation) ---
const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const senderId = req.user._id;
        const senderRole = req.user.role;

        // Get receiver's role for validation
        const receiver = await User.findById(userToChatId).select('role');
        if (!receiver) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if communication is allowed between these roles
        if (!canCommunicate(senderRole, receiver.role)) {
            return res.status(403).json({ 
                error: "Communication not allowed between these user types" 
            });
        }

        // Find conversation containing both users
        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, userToChatId] },
        }).populate("messages"); // .populate() gets the actual message objects, not just IDs

        if (!conversation) {
            // If no conversation exists yet, return an empty array
            return res.status(200).json([]);
        }

        res.status(200).json(conversation.messages);

    } catch (error) {
        console.log("Error in getMessages controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};


// --- EXPORT BOTH FUNCTIONS ---
module.exports = { 
    sendMessage,
    getMessages // Add getMessages here
};
