const express = require('express');
const router = express.Router();
// ඔබේ controller එකේ නම සහ function නම් නිවැරදිදැයි බලන්න
const { registerChild, getChildren } = require('../controllers/childController'); 

// POST Request - /api/children/register
router.post('/register', registerChild);

// GET Request - /api/children
router.get('/', getChildren);

module.exports = router;