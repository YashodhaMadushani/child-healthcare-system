const express = require('express');
const router = express.Router();
const { registerChild, getChildren } = require('../controllers/childController'); 

// POST Request - /api/children/register
router.post('/register', registerChild);

// GET Request - /api/children
router.get('/', getChildren);

module.exports = router;