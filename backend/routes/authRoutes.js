const express = require('express');
const router = express.Router();


const { 
  registerStaff, 
  registerParent, 
  loginUser, 
  getStaff, 
  addChildToParent,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

// Routes Mapping
router.post('/register-staff', registerStaff);
router.post('/register-parent', registerParent);
router.post('/login', loginUser);
router.get('/staff', getStaff);
router.post('/add-child', addChildToParent); 
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;