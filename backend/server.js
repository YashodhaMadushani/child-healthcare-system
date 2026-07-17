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

app.use('/api/children', childRoutes); // Child Management වැඩ ටික
app.use('/api/auth', authRoutes);     // Authentication සහ Staff වැඩ ටික
 
// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected: Child Health System Database"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));