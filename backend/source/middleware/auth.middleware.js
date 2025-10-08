const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protectRoute = async (req, res, next) => {
    console.log('🔍 AUTH MIDDLEWARE STARTED for:', req.method, req.path);
    
    try {
        const token = req.cookies.jwt;
        
        console.log('Token from cookies:', token ? 'Present' : 'Missing');
        
        if (!token) {
            console.log('❌ No token found, returning 401');
            return res.status(401).json({ message: "No token, authorization denied" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);

        if (!decoded) {
            console.log('❌ Token invalid, returning 401');
            return res.status(401).json({ message: "Invalid token" });
        }

        // ✅ Fix: Find user and set req.user properly
        const user = await User.findById(decoded.id).select('-password');
        console.log('User from database:', user ? 'Found' : 'Not found');
        console.log('User details:', user ? { id: user._id, email: user.email } : 'None');
        
        if (!user) {
            console.log('❌ User not found in database, returning 401');
            return res.status(401).json({ message: "User not found" });
        }

        // ✅ CRITICAL: Set req.user to the actual user object
        req.user = user;
        
        console.log('✅ req.user set successfully to:', req.user._id);
        console.log('✅ req.user object keys:', Object.keys(req.user.toObject ? req.user.toObject() : req.user));
        
        console.log('🔍 AUTH MIDDLEWARE COMPLETED, calling next()');
        next();
        
    } catch (error) {
        console.error('❌ Auth middleware error:', error.message);
        console.error('❌ Auth middleware stack:', error.stack);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid token" });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expired" });
        }
        
        res.status(500).json({ message: "Server error in auth middleware" });
    }
};