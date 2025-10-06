const Message = require("../models/Message");
const User = require("../models/User");
const { cloudinary } = require("../lib/cloundinary");

const getAllContacts = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "User not authenticated" });
        }
        
        // ✅ Convert ObjectId to string
        const loggedInUserId = req.user._id.toString();
        const filteredContacts = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
        
        res.status(200).json(filteredContacts);
    } catch (error) {
        console.error("Error fetching contacts:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

const getMessagesByUserId = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        
        // ✅ Convert ObjectId to string
        const myId = req.user._id.toString();
        
        console.log('My ID (string):', myId);
        console.log('Chat with ID:', userToChatId);
        
        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        });

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getMessagesByUserId:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        
        // ✅ Convert ObjectId to string
        const senderId = req.user._id.toString();
        
        console.log('SenderId (string):', senderId);
        console.log('ReceiverId:', receiverId);

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,  
            text,
            image: imageUrl,
        });

        await newMessage.save();
        res.status(201).json(newMessage);

    } catch (error) {
        console.error("Error in sendMessage controller:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getChatPartners = async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const messages = await Message.find({
            $or: [
                { senderId: userId },
                { receiverId: userId }
            ]
        });
        const chatPartnerIds = [...new Set(messages.map(msg => (
            msg.senderId.toString() === userId ? msg.receiverId : msg.senderId
        )))];

        const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password");
        res.status(200).json(chatPartners);
    } catch (error) {
        console.error("Error in getChatPartners:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    getAllContacts,
    getMessagesByUserId,
    sendMessage,
    getChatPartners
};