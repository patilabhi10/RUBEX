require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const fileStorage = require('./utils/fileStorage');

// Import routes
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patient');
const reminderRoutes = require('./routes/reminder');
const patientsRoutes = require('./routes/patients');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/reminder', reminderRoutes);
app.use('/api/patients', patientsRoutes);

// Serve the main index.html file for any other request
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rubex';
console.log('Attempting to connect to MongoDB at:', MONGODB_URI);

const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4
};

let isMongoAvailable = false;

const connectWithRetry = async () => {
    try {
        await mongoose.connect(MONGODB_URI, mongooseOptions);
        console.log('MongoDB connected successfully');
        isMongoAvailable = true;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        isMongoAvailable = false;
        console.log('Using file-based storage system');
    }
    
    if (!isMongoAvailable) {
        setTimeout(connectWithRetry, 30000);
    }
};

connectWithRetry();

// Start server
app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
    console.log(`MongoDB available: ${isMongoAvailable}`);
    console.log(`Using ${isMongoAvailable ? 'MongoDB' : 'file-based'} storage system`);
});