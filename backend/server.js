const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');
const Child = require('./models/Child'); 

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// 1. MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected: Child Health System Database"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ---------------------------------------------------------
// 2. AUTH ROUTES (Register & Login)
// ---------------------------------------------------------

// Register Staff
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role, clinic } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'This email is already in use.' });

    user = new User({ name, email, password, role: role.toLowerCase(), clinic });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();
    res.status(201).json({ msg: 'Staff member registered successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
  const { identifier, password, role } = req.body;
  try {
    const user = await User.findOne({ 
      $or: [{ email: identifier }, { phone: identifier }],
      role: role.toLowerCase() 
    });

    if (!user) return res.status(400).json({ msg: "No user found with this role." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid password." });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ---------------------------------------------------------
// 3. STAFF MANAGEMENT ROUTES
// ---------------------------------------------------------
app.get('/api/users/staff', async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: ['doctor', 'midwife'] } }).select('-password');
    res.json(staff);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ---------------------------------------------------------
// 4. CHILD MANAGEMENT ROUTES 
// ---------------------------------------------------------

// GET: Get all registered children (newest first)
app.get('/api/children', async (req, res) => {
  try {
    // Get children in newest first order
    const children = await Child.find().sort({ createdAt: -1 });
    res.json(children);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Error fetching children." });
  }
});


// POST: Register a new child
app.post('/api/children/register', async (req, res) => {
  try {
    
    console.log("Received Data:", req.body);

    const { 
      childName, dob, gender, birthWeight, 
      birthHeight, motherName, phone, address, registeredBy 
    } = req.body;

    // Validation
    if (!childName || !dob || !motherName || !phone) {
      return res.status(400).json({ msg: 'Please fill in all required fields.' });
    }

    // Creating Unique ID
    const count = await Child.countDocuments();
    const childId = `CH-2026-${(count + 1).toString().padStart(4, '0')}`;

    const newChild = new Child({
      childId,
      childName,
      dob,
      gender: gender || 'Male', 
      birthWeight: birthWeight ? Number(birthWeight) : 0, 
      birthHeight: birthHeight ? Number(birthHeight) : 0,
      motherName,
      phone,
      address,
      registeredBy: registeredBy || 'Staff'
    });

    await newChild.save();
    res.status(201).json({ msg: 'Child registered successfully.', child: newChild });
  } catch (err) {
    
    console.error("Mongoose Save Error:", err.message);
    res.status(500).json({ msg: 'Registration failed: ' + err.message });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));