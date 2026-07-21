const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true }, 
  phone: { type: String, unique: true, sparse: true }, 
  password: { type: String, required: true },
  
  role: { 
    type: String, 
    enum: ['admin', 'doctor', 'midwife', 'parent'], 
    required: true 
  },

  assignedClinic: { type: String, default: "N/A" },
  gender: { type: String, enum: ['Male', 'Female'], required: false },
  age: { type: Number, required: false },
  slmcRegNo: { type: String, required: false },
  nicNo: { type: String, required: false },
  
  children: [{ 
    type: String, 
    required: false 
  }], 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema); 