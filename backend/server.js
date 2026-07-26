const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MVC Routes Linking
const childRoutes = require('./routes/childRoutes');
const authRoutes = require('./routes/authRoutes');
const referralRoutes = require('./routes/referralRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');

app.use('/api/children', childRoutes); // Child Management
app.use('/api/auth', authRoutes);     // Authentication and Staff Management
app.use('/api/referrals', referralRoutes); // Doctor Referrals and Assessments
app.use('/api/schedules', scheduleRoutes); // MOH Clinic Schedules
 
// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected: Child Health System Database"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));