const jwt = require('jsonwebtoken');
const {Env} = require('../lib/env');
const User = require('../models/User'); // ✅ Correct import (no destructuring)

const protectRoute = async (req, res, next) => {
    try {
        let token = req.cookies.token; // ✅ Correct cookie name (remove await)
        if (!token) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }
        
        const decoded = jwt.verify(token, Env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ message: "Not authorized, invalid token" });
        }
        
        const user = await User.findById(decoded.userId).select('-password'); // ✅ Use userId
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