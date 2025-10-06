const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateToken } = require('../lib/utils');
const { sendWelcomeEmail } = require('../emails/emailHandlers'); // ✅ Import from emailHandlers
const {ENV} = require('../lib/env');
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
            await sendWelcomeEmail(savedUser.email, savedUser.fullname, ENV.CLIENT_URL || 'http://localhost:5000');
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

const login = async(req, res) => {
    const {email, password} = req.body;
    try {
        // Validation
        if(!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        // Find user
        const user = await User.findOne({ email });
        if(!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        
        // Check password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        
        // Generate token
        generateToken(user._id, res);
        
        res.status(200).json({
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            profilePic: user.profilePic,
        });
        
    } catch (error) {
        console.error("Error occurred during login:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const logout = async(req, res) => {
    try {
        res.cookie("token", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Error occurred during logout:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = { signup, login, logout };