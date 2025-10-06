const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateToken } = require('../lib/utils');


 const signup = async(req, res) => {
    const {fullname,  email, password} = req.body;
    try {
        if( !fullname || !email || !password ) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if(password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }
        if(!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
            return res.status(400).json({ message: "Invalid email address" });
        }
        const  existingUser = await User.findOne({ email });
        if(existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ fullname, email, password: hashedPassword });
        if(newUser){
            generateToken(newUser._id,res)
            await newUser.save();
            res.status(201).json({ 
                _id: newUser._id,
                fullname: newUser.fullname,
                email: newUser.email,
                profilePic: newUser.profilePic,
                
            });

        }

    } catch (error) {
        console.error("Error occurred during signup:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

 const login = async(req, res) => {
    res.send("Login endpoint");
}

 const logout = async(req, res) => {
    res.send("Logout endpoint");
}

module.exports = { signup, login, logout };