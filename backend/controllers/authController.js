const User = require('../models/User');
const Child = require('../models/Child');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// common utility function to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 1. Register Staff Member (Admin Panel)
const registerStaff = async (req, res) => {
  const { name, email, password, role, clinic } = req.body;
  
  try {
    // Validation: Required fields check
    if (!name || !email || !password || !role) {
      return res.status(400).json({ msg: 'Please enter all required fields.' });
    }

    // Validation: Email format check
    if (!isValidEmail(email)) {
      return res.status(400).json({ msg: 'Invalid email format.' });
    }

    // Validation: Password length check
    if (password.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters long.' });
    }

    // Validation: Check if email already exists in the database
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'This email is already in use.' });

    // store data
    user = new User({ name, email, password, role: role.toLowerCase(), assignedClinic: clinic || "N/A" });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    await user.save();
    res.status(201).json({ msg: 'Staff member registered successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// 2. Register Parent (Mobile App Signup - Updated with OTP and Phone support)
const registerParent = async (req, res) => {
  const { name, digitalHealthId, email, phone, password, otp, isOtpVerification } = req.body;
  
  try {
    if (!name || !digitalHealthId || !password) {
      return res.status(400).json({ msg: 'Please enter all required fields.' });
    }
    if (!email && !phone) {
      return res.status(400).json({ msg: 'Please provide either an Email Address or Phone Number.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters long.' });
    }

    // Validation: Check if the provided Digital Health ID exists in the Child collection
    const childExists = await Child.findOne({ digitalHealthId });
    if (!childExists) {
      return res.status(404).json({ msg: 'Invalid Digital Health ID. Not registered in system.' });
    }

    if (email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) return res.status(400).json({ msg: 'This email is already registered.' });
    }
    if (phone) {
      const phoneExists = await User.findOne({ phone });
      if (phoneExists) return res.status(400).json({ msg: 'This phone number is already registered.' });
    }

    // OTP Verification Phase
    if (!isOtpVerification) {
      return res.status(200).json({ msg: 'OTP sent successfully!', otpRequired: true });
    }

    if (otp !== '1234') {
      return res.status(400).json({ msg: 'Invalid OTP code. Please try again.' });
    }

    // adding child to the children array after parent account creation
    const user = new User({
      name,
      email: email || undefined,
      phone: phone || undefined,
      password,
      role: 'parent',
      children: [digitalHealthId] // User Schema එකේ children array එකට ඇතුළත් වේ
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();
    res.status(201).json({ msg: 'Registration successful! You can now login.', childName: childExists.name });
  } catch (err) {
    console.error("Parent Signup Error:", err.message);
    res.status(500).send("Server Error");
  }
};

// 3. common Login Function for both Staff and Parent
const loginUser = async (req, res) => {
  const { identifier, password, role } = req.body;
  
  try {
    // Validation: empty fields check
    if (!identifier || !password || !role) {
      return res.status(400).json({ msg: 'Please enter all fields.' });
    }

    // Validation: Check if the user exists with the provided identifier (email or phone) and role
    const user = await User.findOne({ 
      $or: [{ email: identifier }, { phone: identifier }],
      role: role.toLowerCase() 
    });

    if (!user) return res.status(400).json({ msg: 'No user found with this credentials/role.' });

    // Validation: Check if the password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid password.' });

    // JWT Token generation
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        role: user.role,
        children: user.children 
      } 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// 4. Get all Staff members
const getStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: ['doctor', 'midwife'] } }).select('-password');
    res.json(staff);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// 5. Add Another Child to Parent's Account (using digitalHealthId)
const addChildToParent = async (req, res) => {
  const { userId, digitalHealthId } = req.body; 
  
  try {
    // Validation: empty fields check
    if (!userId || !digitalHealthId) {
      return res.status(400).json({ msg: 'User ID and Digital Health ID are required.' });
    }

    // Validation: Check if the provided Digital Health ID exists in the Child collection
    const childExists = await Child.findOne({ digitalHealthId });
    if (!childExists) return res.status(404).json({ msg: 'Digital Health ID not found in system.' });

    // Find the parent user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'Parent account not found.' });

    // Validation: Check if the provided Digital Health ID is already linked to the parent's account (Duplicate Check)
    if (user.children.includes(digitalHealthId)) {
      return res.status(400).json({ msg: 'This child is already linked to your account.' });
    }

    // add the new child to the array
    user.children.push(digitalHealthId);
    await user.save();

    res.status(200).json({ msg: 'Child added successfully!', childName: childExists.name });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

module.exports = { registerStaff, registerParent, loginUser, getStaff, addChildToParent };