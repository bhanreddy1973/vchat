const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateToken } = require('../lib/utils');
const { sendWelcomeEmail } = require('../emails/emailHandlers'); // ✅ Import from emailHandlers
const {Env} = require('../lib/env');
const { cloudinary } = require('../lib/cloudinary');
// Rest of your auth.controller.js code remains the same...

const signup = async(req, res) => {
    const {fullname, email, password} = req.body;
    try {
        // Validation
        if(!fullname || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if(password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }
        if(!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
            return res.status(400).json({ message: "Invalid email address" });
        }
        
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if(existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }
        
        // Hash password and create user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ fullname, email, password: hashedPassword });
        
        // Save user to database
        const savedUser = await newUser.save();
        
        // Generate JWT token
        generateToken(savedUser._id, res);
        
        // Send welcome email (don't let email failure break signup)
        try {
            await sendWelcomeEmail(savedUser.email, savedUser.fullname, Env.CLIENT_URL || 'http://localhost:5000');
        } catch (emailError) {
            console.error("Failed to send welcome email:", emailError);
        }
        
        // Send success response
        res.status(201).json({ 
            _id: savedUser._id,
            fullname: savedUser.fullname,
            email: savedUser.email,
            profilePic: savedUser.profilePic,
        });

    } catch (error) {
        console.error("Error occurred during signup:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// In your backend auth.controller.js

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('🔍 Login attempt for email:', email);
        
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // ✅ Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });

        // ✅ Set httpOnly cookie
        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production"
        });

        console.log('✅ Login successful for user:', user._id);
        console.log('✅ JWT token generated and cookie set');

        res.status(200).json({
            user: {
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                profilePic: user.profilePic
            }
        });

    } catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const logout = async(req, res) => {
    try {
        res.cookie("token", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Error occurred during logout:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// In auth.controller.js
const updateProfile = async (req, res) => {
    try {
        console.log('=== UPDATE PROFILE DEBUG ===');
        const bodySize = JSON.stringify(req.body).length;
        console.log('Request body size:', (bodySize / 1024 / 1024).toFixed(2), 'MB');
        
        const { profilePic } = req.body;
        const userId = req.user._id;

        // ✅ Validate payload size (10MB limit for base64)
        if (profilePic && profilePic.length > 10000000) { // 10MB limit
            return res.status(413).json({ 
                message: "Image too large. Please choose an image smaller than 5MB." 
            });
        }

        // ✅ Validate base64 format
        if (profilePic && !profilePic.startsWith('data:image/')) {
            return res.status(400).json({ 
                message: "Invalid image format" 
            });
        }

        console.log('Updating profile for user:', userId);
        console.log('Profile pic size:', profilePic ? (profilePic.length / 1024).toFixed(2) + 'KB' : 'No image');

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log('✅ Profile updated successfully');

        res.status(200).json({
            user: updatedUser
        });

    } catch (error) {
        console.error("Update profile error:", error);
        
        // ✅ Handle specific MongoDB errors
        if (error.name === 'DocumentTooLarge') {
            return res.status(413).json({ 
                message: "Image too large for database storage" 
            });
        }
        
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ 
                message: "File size too large" 
            });
        }
        
        res.status(500).json({
            message: "Internal server error",
            ...(process.env.NODE_ENV === 'development' && { 
                error: error.message 
            })
        });
    }
};

const checkAuth = async (req, res) => {
    try {
        res.status(200).json({ user: req.user });
    } catch (error) {
        console.error("Error in checkAuth controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Then update your exports
module.exports = { 
    signup, 
    login, 
    logout, 
    updateProfile,
    checkAuth  // ✅ Add this export
};