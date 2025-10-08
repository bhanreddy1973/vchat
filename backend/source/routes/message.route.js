const express = require('express');
const { protectRoute } = require('../middleware/auth.middleware');
const { 
    getContacts, 
    getMessages, 
    getChats, 
    sendMessage 
} = require('../controllers/message.controller');

const router = express.Router();

console.log('📝 MESSAGE ROUTES LOADING...');

// ✅ UNCOMMENT THIS LINE - Apply authentication middleware to all routes
router.use(protectRoute);

// ✅ Routes that match your frontend calls
router.get("/contacts", getContacts);           // GET /api/messages/contacts
router.get("/chats", getChats);                // GET /api/messages/chats  
router.get("/:userId", getMessages);           // GET /api/messages/:userId
router.post("/send/:userId", sendMessage);     // POST /api/messages/send/:userId

// Test route
router.get('/test', (req, res) => {
    console.log('📍 TEST ROUTE HIT');
    console.log('req.user in test:', !!req.user);
    res.json({ 
        message: 'Message route working!',
        authenticated: !!req.user,
        userId: req.user?._id 
    });
});

console.log('✅ MESSAGE ROUTES LOADED');

module.exports = router;