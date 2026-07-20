const express = require('express');
const router = express.Router();
const { 
  getPendingReferrals, 
  submitAssessment, 
  resetReferrals 
} = require('../controllers/referralController');

// GET Request - Fetch all pending referrals
router.get('/', getPendingReferrals);

// POST Request - Submit diagnosis & assessment
router.post('/:id/assess', submitAssessment);

// POST Request - Reset mock data for demo
router.post('/reset', resetReferrals);

module.exports = router;
