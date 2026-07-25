const express = require('express');
const router = express.Router();
const { 
  getPendingReferrals, 
  submitAssessment, 
  resetReferrals,
  getReviewedReferrals
} = require('../controllers/referralController');

// GET Request - Fetch all pending referrals
router.get('/', getPendingReferrals);

// GET Request - Fetch all reviewed consultations
router.get('/reviewed', getReviewedReferrals);


// POST Request - Submit diagnosis & assessment
router.post('/:id/assess', submitAssessment);

// POST Request - Reset mock data for demo
router.post('/reset', resetReferrals);

module.exports = router;
