require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');

const app = express();

// Middleware
app.use(express.json());

// Database Connection 
// We use an async function to handle the promise returned by mongoose.connect
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        // Exit process with failure if DB connection fails
        process.exit(1); 
    }
};

// Initialize the connection
connectDB();

// Routes
app.use('/auth', authRoutes);
app.use('/api', protectedRoutes);

// Server Setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});