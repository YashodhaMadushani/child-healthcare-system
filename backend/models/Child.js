
const mongoose = require('mongoose');

const ChildSchema = new mongoose.Schema({
  childId: { type: String, required: true, unique: true },
  childName: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, required: true },
  birthWeight: { type: Number },
  birthHeight: { type: Number },
  motherName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String },
  registeredBy: { type: String, required: false } 
}, { timestamps: true });

module.exports = mongoose.model('Child', ChildSchema);