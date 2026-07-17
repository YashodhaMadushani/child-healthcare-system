const mongoose = require('mongoose');

const ChildSchema = new mongoose.Schema({
  digitalHealthId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, required: true },
  birthWeight: { type: Number, default: 0 },
  birthHeight: { type: Number, default: 0 },
  motherName: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  registeredBy: { type: String, default: "Staff Member" }
}, { timestamps: true });

module.exports = mongoose.model('Child', ChildSchema);