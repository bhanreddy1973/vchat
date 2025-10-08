const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors');

dotenv.config();

const app = express();

// Create HTTP server and Socket.IO
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://vchat-xn0io.sevalla.app','http://localhost:5173'] 
      : ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }
});

const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://vchat-xn0io.sevalla.app', 'http://localhost:5173'] 
        : ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database connection
const connectDB = require('./lib/db');

// Routes
const authRoute = require('./routes/auth.route');
const messageRoute = require('./routes/message.route');

app.use("/api/auth", authRoute);
app.use("/api/messages", messageRoute);

// Static file serving for production
if (process.env.NODE_ENV === "production") {
    const staticPath = path.join(__dirname, "../../frontend/dist");
    // console.log("📁 Serving static files from:", staticPath);
    
    app.use(express.static(staticPath));
    
    // Handle SPA routing
    app.get("*", (req, res) => {
        // Skip API routes
        if (req.path.startsWith('/api/')) {
            return res.status(404).json({ message: 'API route not found' });
        }
        
        const indexPath = path.join(__dirname, "../../frontend/dist/index.html");
        // console.log("📄 Serving index.html from:", indexPath);
        
        res.sendFile(indexPath, (err) => {
            if (err) {
                console.error("❌ Error serving index.html:", err);
                res.status(500).send("Error loading application");
            }
        });
    });
} else {
    app.get('/', (req, res) => {
        res.json({ 
            message: 'Chatify API is running!',
            environment: process.env.NODE_ENV || 'development',
            port: PORT
        });
    });
}

// Socket.IO setup
const onlineUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
    // console.log(`✅ User connected: ${socket.id}`);
    
    const userId = socket.handshake.query.userId;
    if (userId && userId !== 'undefined') {
        onlineUsers.set(userId, socket.id);
        // console.log(`👤 User ${userId} is online`);
        
        // Broadcast online users to all clients
        io.emit('getOnlineUsers', Array.from(onlineUsers.keys()));
    }

    // Handle disconnection
    socket.on('disconnect', () => {
        // console.log(`❌ User disconnected: ${socket.id}`);
        
        if (userId && userId !== 'undefined') {
            onlineUsers.delete(userId);
            // console.log(`👤 User ${userId} went offline`);
            
            // Broadcast updated online users
            io.emit('getOnlineUsers', Array.from(onlineUsers.keys()));
        }
    });
});

// Make io accessible globally for message controller
global.io = io;
global.getReceiverSocketId = (receiverId) => {
    return onlineUsers.get(receiverId.toString());
};

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server with proper error handling
const startServer = async () => {
    try {
        await connectDB();
        console.log('✅ Database connected successfully');
        
        server.listen(PORT, () => {
            console.log(`✅ Server running on port ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            // console.log(`🔌 Socket.IO enabled`);
            // console.log(`📡 Current directory: ${__dirname}`);
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = { app, server, io };