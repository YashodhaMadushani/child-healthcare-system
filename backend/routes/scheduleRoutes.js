const express = require('express');
const router = express.Router();
const { 
  getSchedules, 
  createSchedule, 
  deleteSchedule 
} = require('../controllers/scheduleController');

// GET /api/schedules - Fetch all clinic schedules
router.get('/', getSchedules);

// POST /api/schedules - Create a new schedule session
router.post('/', createSchedule);

// DELETE /api/schedules/:id - Delete/Cancel a session
router.delete('/:id', deleteSchedule);

module.exports = router;
