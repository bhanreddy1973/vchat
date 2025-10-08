// ✅ Fix the import paths to match your actual file names
const Message = require("../models/Message");
const User = require("../models/User");
const cloudinary = require("../lib/cloudinary"); // ✅ Match your actual filename

// ✅ Renamed to match route imports: getUsersForSidebar -> getContacts
const getContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    console.log(`✅ Getting contacts for user: ${loggedInUserId}`);
    
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    console.log(`✅ Found contacts: ${filteredUsers.length}`);
    
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getContacts: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getMessages = async (req, res) => {
  try {
    // ✅ Updated to match route parameter: id -> userId
    const { userId: userToChatId } = req.params;
    const myId = req.user._id;

    console.log(`✅ Getting messages between: ${myId} and ${userToChatId}`);

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    console.log(`✅ Found messages: ${messages.length}`);
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    // ✅ Updated to match route parameter: id -> userId
    const { userId: receiverId } = req.params;
    const senderId = req.user._id;

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

    // ✅ Send real-time message to receiver
    const receiverSocketId = global.getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      global.io.to(receiverSocketId).emit("newMessage", newMessage);
      console.log(`📡 Real-time message sent to ${receiverId}`);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Renamed to match route imports: getMyChatPartners -> getChats
const getChats = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(`✅ Getting chats for user: ${userId}`);

    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ createdAt: -1 });

    const chatPartnerIds = new Set();
    
    messages.forEach(message => {
      if (message.senderId.toString() !== userId.toString()) {
        chatPartnerIds.add(message.senderId.toString());
      }
      if (message.receiverId.toString() !== userId.toString()) {
        chatPartnerIds.add(message.receiverId.toString());
      }
    });

    const chatPartners = await User.find({
      _id: { $in: Array.from(chatPartnerIds) }
    }).select("-password");

    console.log(`✅ Returning chats: ${chatPartners.length}`);
    res.status(200).json(chatPartners);
  } catch (error) {
    console.error("Error in getChats controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Export with names that match your route imports
module.exports = {
  getContacts,    // Was: getUsersForSidebar
  getMessages,
  sendMessage,
  getChats,       // Was: getMyChatPartners
};