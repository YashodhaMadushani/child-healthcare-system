const express = require('express');
const router = express.Router();

// 💡 මෙතන උඩින්ම addChildToParent කියන එකත් controller එකෙන් import කරගන්නවා
const { 
  registerStaff, 
  registerParent, 
  loginUser, 
  getStaff, 
  addChildToParent // 👈 මේ නම මෙතන තියෙනවාදැයි ඩබල් චෙක් කරගන්න
} = require('../controllers/authController');

// Routes Mapping
router.post('/register-staff', registerStaff);
router.post('/register-parent', registerParent);
router.post('/login', loginUser);
router.get('/staff', getStaff);
router.post('/add-child', addChildToParent); 

module.exports = router;