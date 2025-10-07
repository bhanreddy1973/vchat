const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors');

// ✅ Load environment variables first
dotenv.config();

const app = express();

// ✅ Import Env after dotenv.config()
const { Env } = require('./lib/env');

// ✅ Add CORS middleware with proper configuration
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173', // Use process.env directly or fallback
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Other middleware
app.use(express.json());
app.use(cookieParser());

// Import database connection
const connectDB = require('./lib/db');

// Import routes
const authRoute = require('./routes/auth.route');
const messageRoute = require('./routes/message.route');

const PORT = Env.PORT || 5000;

// API routes
app.use("/api/auth", authRoute);    
app.use("/api/message", messageRoute);

// Serve static files in production
if(Env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"../../frontend/dist")));
    
    app.get("*",(req,res)=>{
        res.sendFile(path.resolve(__dirname,"../../frontend/dist/index.html"));
    });
} else {
    app.get('/', (req, res) => {
        res.json({ message: 'Chatify API is running in development mode!' });
    });
}

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    connectDB();
});