const jwt = require('jsonwebtoken');
const {Env} = require('../lib/env');
const User = require('../models/User');

const protectRoute = async (req, res, next) => {
    try {
        let token = req.cookies.token;
        
        if (!token) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }
        
        const decoded = jwt.verify(token, Env.JWT_SECRET);
        
        if (!decoded) {
            return res.status(401).json({ message: "Not authorized, invalid token" });
        }
        
        const user = await User.findById(decoded.id).select('-password');
        
        if(!user) {
            return res.status(401).json({ message: "User Not Found" });
        }
        
        req.user = user;
        return next(); // ✅ Only call next() and return early
        
    } catch (error) {
        console.error("Error in protectRoute middleware:", error);
        // ✅ Make sure we don't send multiple responses
        if (!res.headersSent) {
            return res.status(401).json({ message: "Not authorized" });
        }
    }
};

module.exports = { protectRoute };