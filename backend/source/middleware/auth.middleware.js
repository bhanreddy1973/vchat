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
        console.log('Decoded token:', decoded); // Debug
        
        if (!decoded) {
            return res.status(401).json({ message: "Not authorized, invalid token" });
        }
        
        // ✅ Make sure we're using the correct property
        const user = await User.findById(decoded.id).select('-password');
        console.log('User from DB:', user); // Debug
        console.log('User _id type:', typeof user._id); // Debug
        console.log('User _id value:', user._id); // Debug
        
        if(!user) {
            return res.status(401).json({ message: "User Not Found" });
        }
        
        req.user = user;
        next();
        
    } catch (error) {
        console.error("Error in protectRoute middleware:", error);
        return res.status(401).json({ message: "Not authorized" });
    }
};

module.exports = { protectRoute };