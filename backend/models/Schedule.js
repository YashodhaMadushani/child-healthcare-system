const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  clinicCenter: { type: String, required: true },
  sessionType: { type: String, required: true },
  date: { type: Date, required: true },
  assignedStaff: { type: String, default: "MOH Doctor" },
  expectedCapacity: { type: Number, default: 30 },
  status: { 
    type: String, 
    enum: ['Scheduled', 'Active', 'Completed'], 
    default: 'Scheduled' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Schedule', ScheduleSchema);
