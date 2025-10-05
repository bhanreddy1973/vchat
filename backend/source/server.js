const express = require('express');
const dotenv = require('dotenv');
const authRoute = require('./routes/auth.route');
const messageRoute = require('./routes/message.route');

dotenv.config();


const app = express();
const PORT = process.env.PORT || 5000;
app.use("/api/auth", authRoute);    
app.use("/api/message", messageRoute);


app.listen(PORT ,()=> console.log(`Server started on port ${PORT}`));