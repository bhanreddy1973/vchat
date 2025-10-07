// Add this to your server.js
const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors');

dotenv.config();

const app = express();
const { Env } = require('./lib/env');

const PORT = process.env.PORT || Env.PORT || 5000;

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://vchat-xn0io.sevalla.app'] 
        : ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

// Database connection
const connectDB = require('./lib/db');

// Routes
const authRoute = require('./routes/auth.route');
const messageRoute = require('./routes/message.route');

app.use("/api/auth", authRoute);
app.use("/api/message", messageRoute);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
    
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "../frontend/dist/index.html"));
    });
} else {
    app.get('/', (req, res) => {
        res.json({ message: 'Chatify API is running!' });
    });
}

// ✅ Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Internal server error' });
});

// ✅ Start server with proper error handling
const startServer = async () => {
    try {
        await connectDB();
        console.log('✅ Database connected');
        
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`✅ Server running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();