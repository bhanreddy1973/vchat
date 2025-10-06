const mongoose = require('mongoose');
const { Env } = require('./env');


const connectDB = async () => {
    try {
         const { MONGODB_URL } = Env;
         if (!MONGODB_URL) {
             throw new Error('MONGODB_URL is not defined in environment variables');
         }

        await mongoose.connect(MONGODB_URL);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;