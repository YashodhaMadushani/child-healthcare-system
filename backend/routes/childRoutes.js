const express = require('express');
const router = express.Router();
const { 
  registerChild, 
  getChildren, 
  getChildById,
  addGrowthRecord,
  updateVaccineStatus,
  updateObservations,
  recordClinicVisit
} = require('../controllers/childController'); 

// POST Request - /api/children/register
router.post('/register', registerChild);

// GET Request - /api/children
router.get('/', getChildren);

// GET Request - /api/children/:id
router.get('/:id', getChildById);

// POST Request - Log new child growth/weight measurements
router.post('/:id/measurements', addGrowthRecord);

// POST Request - Record Clinic Visit (Bulk details)
router.post('/:id/clinic-visit', recordClinicVisit);

// POST Request - Update immunization details
router.post('/:id/vaccinations', updateVaccineStatus);

// POST Request - Update midwife clinical observations
router.post('/:id/observations', updateObservations);

module.exports = router;