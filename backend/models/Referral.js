const mongoose = require('mongoose');

const ReferralSchema = new mongoose.Schema({
  digitalHealthId: { type: String, required: true },
  name: { type: String, required: true },
  initials: { type: String, required: true },
  age: { type: String, required: true },
  gender: { type: String, required: true },
  alertLevel: { type: String, required: true }, // Critical, High, Moderate
  waitTime: { type: String, required: true },
  alertReason: { type: String, required: true },
  village: { type: String, required: true },
  referredBy: { type: String, required: true },
  vitals: {
    temp: { type: String, required: true },
    hr: { type: String, required: true },
    bp: { type: String, required: true },
    tempAbnormal: { type: Boolean, default: false },
    hrAbnormal: { type: Boolean, default: false }
  },
  percentiles: {
    weight: { type: Number, required: true },
    height: { type: Number, required: true }
  },
  weightHistory: { type: String, required: true },
  historyNotes: { type: String, required: true },
  keyFacts: [
    {
      label: { type: String },
      value: { type: String }
    }
  ],
  chartData: [
    {
      month: { type: String },
      weight: { type: Number },
      whoMedian: { type: Number },
      whoThird: { type: Number }
    }
  ],
  status: { type: String, default: 'Pending' }, // Pending, Reviewed
  assessment: {
    diagnosis: { type: String },
    treatment: { type: String },
    specialistReferral: { type: String },
    reviewDate: { type: String },
    reviewedAt: { type: Date }
  }
}, { timestamps: true });

module.exports = mongoose.model('Referral', ReferralSchema);
