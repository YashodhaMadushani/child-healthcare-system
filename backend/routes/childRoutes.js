const express = require('express');
const router = express.Router();
const { registerChild, getChildren, getChildById } = require('../controllers/childController'); 

// POST Request - /api/children/register
router.post('/register', registerChild);

// GET Request - /api/children
router.get('/', getChildren);

// GET Request - /api/children/:id
router.get('/:id', getChildById);

module.exports = router;