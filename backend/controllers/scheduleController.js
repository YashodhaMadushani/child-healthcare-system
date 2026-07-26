const Schedule = require('../models/Schedule');

// Fetch all clinic schedules
const getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find().sort({ date: 1 });
    res.status(200).json(schedules);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Create a new clinic schedule
const createSchedule = async (req, res) => {
  const { clinicCenter, sessionType, date, assignedStaff, expectedCapacity } = req.body;

  try {
    if (!clinicCenter || !sessionType || !date) {
      return res.status(400).json({ msg: 'Please provide center, type and date.' });
    }

    const newSchedule = new Schedule({
      clinicCenter,
      sessionType,
      date,
      assignedStaff: assignedStaff || "MOH Doctor",
      expectedCapacity: expectedCapacity || 30
    });

    await newSchedule.save();
    res.status(201).json(newSchedule);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Delete/Cancel a clinic schedule
const deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) {
      return res.status(404).json({ msg: 'Schedule not found.' });
    }
    res.status(200).json({ success: true, msg: 'Schedule deleted successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

module.exports = {
  getSchedules,
  createSchedule,
  deleteSchedule
};
