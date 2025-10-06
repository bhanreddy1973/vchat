const express = require('express');
const { getAllContacts } = require('../controllers/message.controller');
const { getChatPartners } = require('../controllers/message.controller');
const { protectRoute } = require('../middleware/auth.middleware'); // Import auth
const { getMessagesByUserId, sendMessage } = require('../controllers/message.controller');

const router = express.Router();
const {protectRoute: arcjetProtect} = require('../middleware/arcjet.middleware');

// Protect the route with authentication
router.use(arcjetProtect, protectRoute);
router.get('/contacts', getAllContacts); // ✅ Add protectRoute middleware
router.get("/chats", getChatPartners); // ✅ Add protectRoute middleware
router.get("/:id", getMessagesByUserId); // ✅ Add protectRoute middleware
router.post("/send/:id", sendMessage); // ✅ Add protectRoute middleware

// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'Message route working!' });
});

module.exports = router;