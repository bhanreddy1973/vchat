const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Add middleware
app.use(express.json());

// Add a root route for testing
// app.get('/', (req, res) => {
//     res.json({ message: 'Chatify server is running!' });
// });

// Import routes (make sure these files exist)
const authRoute = require('./routes/auth.route');
const messageRoute = require('./routes/message.route');

const PORT = process.env.PORT || 5000;

app.use("/api/auth", authRoute);    
app.use("/api/message", messageRoute);

// Serve static files in production
if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"../../frontend/dist")));
    
    // Catch-all: serve React app for non-API routes
    app.get("*",(req,res)=>{
        res.sendFile(path.resolve(__dirname,"../../frontend/dist/index.html"));
    });
} else {
    app.get('/', (req, res) => {
        res.json({ message: 'Development server running!' });
    });
}

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));