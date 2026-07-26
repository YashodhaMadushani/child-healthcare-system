const express = require('express');
const router = express.Router();
const { 
  getPendingReferrals, 
  submitAssessment, 
  resetReferrals,
  getReviewedReferrals,
  getSpecialistReferrals
} = require('../controllers/referralController');

// GET Request - Fetch all pending referrals
router.get('/', getPendingReferrals);

// GET Request - Fetch all reviewed consultations
router.get('/reviewed', getReviewedReferrals);

// GET Request - Fetch all outbound specialist referrals
router.get('/specialist-referrals', getSpecialistReferrals);


// POST Request - Submit diagnosis & assessment
router.post('/:id/assess', submitAssessment);

// POST Request - Reset mock data for demo
router.post('/reset', resetReferrals);

module.exports = router;
