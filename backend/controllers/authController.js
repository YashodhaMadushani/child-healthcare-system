const User = require('../models/User');
const Child = require('../models/Child');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 🌟 පොදු Email Validation Function එකක්
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 1. Staff සාමාජිකයින් ලියාපදිංචි කිරීම
const registerStaff = async (req, res) => {
  const { name, email, password, role, clinic } = req.body;
  
  try {
    // Validation: සියලුම දත්ත ඇතුළත් කර ඇත්දැයි බැලීම
    if (!name || !email || !password || !role) {
      return res.status(400).json({ msg: 'Please enter all required fields.' });
    }

    // Validation: Email ආකෘතිය නිවැරදිදැයි බැලීම
    if (!isValidEmail(email)) {
      return res.status(400).json({ msg: 'Invalid email format.' });
    }

    // Validation: Password එකේ ආරක්ෂාව (අවම වශයෙන් අකුරු 6ක්)
    if (password.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters long.' });
    }

    // Validation: දැනටමත් Email එක පද්ධතියේ තිබේදැයි බැලීම
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'This email is already in use.' });

    // දත්ත තැන්පත් කිරීම
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

// 2. මව්පියන් ලියාපදිංචි කිරීම (Mobile App Signup - Updated with OTP and Phone support)
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

    // Web එකෙන් ඇතුළත් කළ පළමු දරුවාගේ ID එක (e.g., SL-2026-01) පද්ධතියේ ඇත්දැයි බැලීම
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

    // නව මව්පිය ගිණුම සාදා දරුවාව children array එකට එකතු කිරීම
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

// 3. පොදු Login පද්ධතිය (Staff & Parents)
const loginUser = async (req, res) => {
  const { identifier, password, role } = req.body;
  
  try {
    // Validation: හිස් දත්ත පරීක්ෂාව
    if (!identifier || !password || !role) {
      return res.status(400).json({ msg: 'Please enter all fields.' });
    }

    // පරිශීලකයා සෙවීම (Email හෝ Phone Number මඟින් ලොග් විය හැක)
    const user = await User.findOne({ 
      $or: [{ email: identifier }, { phone: identifier }],
      role: role.toLowerCase() 
    });

    if (!user) return res.status(400).json({ msg: 'No user found with this credentials/role.' });

    // Validation: මුරපදය ගැලපේදැයි බැලීම
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid password.' });

    // JWT Token ජනනය කිරීම
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        role: user.role,
        children: user.children // Mobile App එකට ලින්ක් වූ සියලුම දරුවන්ගේ Digital IDs යවයි
      } 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// 4. සියලුම Staff ලැයිස්තුව ලබා ගැනීම
const getStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: ['doctor', 'midwife'] } }).select('-password');
    res.json(staff);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// 5. මවගේ ගිණුමට තවත් දරුවෙක් එකතු කිරීම (Add Another Child using digitalHealthId)
const addChildToParent = async (req, res) => {
  const { userId, digitalHealthId } = req.body; 
  
  try {
    // Validation: හිස් දත්ත පරීක්ෂාව
    if (!userId || !digitalHealthId) {
      return res.status(400).json({ msg: 'User ID and Digital Health ID are required.' });
    }

    // Validation: එකතු කරන අලුත් දරුවාගේ Digital ID එක System එකේ ඉන්නවාදැයි බැලීම
    const childExists = await Child.findOne({ digitalHealthId });
    if (!childExists) return res.status(404).json({ msg: 'Digital Health ID not found in system.' });

    // මව්පියන්ව සොයා ගැනීම
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'Parent account not found.' });

    // Validation: මේ Digital ID එක දැනටමත් මේ ගිණුමට ලින්ක් කර ඇත්දැයි බැලීම (Duplicate Check)
    if (user.children.includes(digitalHealthId)) {
      return res.status(400).json({ msg: 'This child is already linked to your account.' });
    }

    // Array එකට Digital ID එක එකතු කිරීම
    user.children.push(digitalHealthId);
    await user.save();

    res.status(200).json({ msg: 'Child added successfully!', childName: childExists.name });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

module.exports = { registerStaff, registerParent, loginUser, getStaff, addChildToParent };