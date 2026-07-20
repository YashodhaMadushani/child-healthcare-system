const Referral = require('../models/Referral');

const MOCK_REFERRALS = [
  {
    name: "Senuri Perera",
    digitalHealthId: "SL-2024-1-30066",
    initials: "SP",
    age: "18 Months",
    gender: "Female",
    alertLevel: "Critical",
    waitTime: "12m ago",
    alertReason: "Severe Underweight (Grade III)",
    village: "Kirulapone",
    referredBy: "Midwife Priyanthi",
    vitals: { temp: "38.2°C", hr: "125 bpm", bp: "95/60 mmHg", tempAbnormal: true, hrAbnormal: true },
    percentiles: { weight: 8, height: 12 },
    weightHistory: "8.5kg -> 8.2kg (Drop Alert)",
    historyNotes: "Presented with loss of appetite over the last two weeks. Midwife noted drop on growth chart during routine field visit.",
    keyFacts: [
      { label: "Birth Weight", value: "3.1 kg" },
      { label: "Delivery Type", value: "Normal" },
      { label: "Immunizations", value: "Up to date" },
      { label: "Gestational Age", value: "39 weeks" }
    ],
    chartData: [
      { month: '12M', weight: 8.8, whoMedian: 9.2, whoThird: 8.0 },
      { month: '14M', weight: 8.6, whoMedian: 9.6, whoThird: 8.4 },
      { month: '16M', weight: 8.5, whoMedian: 10.0, whoThird: 8.7 },
      { month: '18M', weight: 8.2, whoMedian: 10.2, whoThird: 8.9 }
    ],
    status: 'Pending'
  },
  {
    name: "Sahan Perera",
    digitalHealthId: "SL-2026-1-93929",
    initials: "SP",
    age: "6 Months",
    gender: "Male",
    alertLevel: "High",
    waitTime: "25m ago",
    alertReason: "Persistent Fever Post-Vaccination",
    village: "Thimbirigasyaya",
    referredBy: "Midwife Nilanthi",
    vitals: { temp: "39.1°C", hr: "140 bpm", bp: "88/50 mmHg", tempAbnormal: true, hrAbnormal: true },
    percentiles: { weight: 35, height: 42 },
    weightHistory: "6.8kg -> 6.8kg (Stagnant)",
    historyNotes: "Developed fever 24 hours post Pentavalent 3 vaccine. Acetaminophen given by mother, but temperature remains high.",
    keyFacts: [
      { label: "Birth Weight", value: "2.8 kg" },
      { label: "Delivery Type", value: "C-Section" },
      { label: "Immunizations", value: "Pentavalent 3" },
      { label: "Gestational Age", value: "38 weeks" }
    ],
    chartData: [
      { month: '3M', weight: 6.0, whoMedian: 6.4, whoThird: 5.7 },
      { month: '4M', weight: 6.3, whoMedian: 7.0, whoThird: 6.2 },
      { month: '5M', weight: 6.6, whoMedian: 7.5, whoThird: 6.7 },
      { month: '6M', weight: 6.8, whoMedian: 7.9, whoThird: 7.0 }
    ],
    status: 'Pending'
  },
  {
    name: "Dilshan Silva",
    digitalHealthId: "SL-2025-2-45210",
    initials: "DS",
    age: "12 Months",
    gender: "Male",
    alertLevel: "Critical",
    waitTime: "40m ago",
    alertReason: "Severe Wasting & Lethargy",
    village: "Havelock Town",
    referredBy: "Midwife Priyanthi",
    vitals: { temp: "36.5°C", hr: "115 bpm", bp: "90/58 mmHg", tempAbnormal: false, hrAbnormal: false },
    percentiles: { weight: 9, height: 15 },
    weightHistory: "9.1kg -> 8.6kg (Rapid Drop)",
    historyNotes: "Marked fatigue and poor feeding observed. Midwife noted drop in weight velocity over two consecutive months.",
    keyFacts: [
      { label: "Birth Weight", value: "3.2 kg" },
      { label: "Delivery Type", value: "Normal" },
      { label: "Immunizations", value: "Up to date" },
      { label: "Gestational Age", value: "40 weeks" }
    ],
    chartData: [
      { month: '9M', weight: 8.9, whoMedian: 8.9, whoThird: 7.8 },
      { month: '10M', weight: 9.1, whoMedian: 9.2, whoThird: 8.0 },
      { month: '11M', weight: 8.8, whoMedian: 9.4, whoThird: 8.2 },
      { month: '12M', weight: 8.6, whoMedian: 9.6, whoThird: 8.4 }
    ],
    status: 'Pending'
  },
  {
    name: "Methuni Fernando",
    digitalHealthId: "SL-2024-3-88210",
    initials: "MF",
    age: "24 Months",
    gender: "Female",
    alertLevel: "Moderate",
    waitTime: "55m ago",
    alertReason: "Delayed Developmental Milestones",
    village: "Pamankada",
    referredBy: "Midwife Nilanthi",
    vitals: { temp: "36.8°C", hr: "98 bpm", bp: "95/62 mmHg", tempAbnormal: false, hrAbnormal: false },
    percentiles: { weight: 65, height: 60 },
    weightHistory: "11.2kg -> 11.3kg (Normal)",
    historyNotes: "Physically healthy but child is not walking independently yet. Speech development limited to single words.",
    keyFacts: [
      { label: "Birth Weight", value: "3.4 kg" },
      { label: "Delivery Type", value: "Normal" },
      { label: "Immunizations", value: "Up to date" },
      { label: "Gestational Age", value: "39 weeks" }
    ],
    chartData: [
      { month: '18M', weight: 10.5, whoMedian: 10.2, whoThird: 8.9 },
      { month: '20M', weight: 10.8, whoMedian: 10.6, whoThird: 9.2 },
      { month: '22M', weight: 11.2, whoMedian: 11.0, whoThird: 9.5 },
      { month: '24M', weight: 11.3, whoMedian: 11.5, whoThird: 9.8 }
    ],
    status: 'Pending'
  },
  {
    name: "Arshad Rahaman",
    digitalHealthId: "SL-2025-1-10293",
    initials: "AR",
    age: "9 Months",
    gender: "Male",
    alertLevel: "High",
    waitTime: "1h ago",
    alertReason: "Chronic Diarrhea & Dehydration Risk",
    village: "Narahenpita",
    referredBy: "Midwife Fathima",
    vitals: { temp: "37.5°C", hr: "135 bpm", bp: "85/48 mmHg", tempAbnormal: false, hrAbnormal: true },
    percentiles: { weight: 18, height: 28 },
    weightHistory: "7.9kg -> 7.4kg (Critical Drop)",
    historyNotes: "Diarrhea for 4 days. Poor oral intake. Midwife recommends immediate clinical evaluation for IV fluids or ORS schedule.",
    keyFacts: [
      { label: "Birth Weight", value: "3.0 kg" },
      { label: "Delivery Type", value: "Normal" },
      { label: "Immunizations", value: "Up to date" },
      { label: "Gestational Age", value: "40 weeks" }
    ],
    chartData: [
      { month: '6M', weight: 7.8, whoMedian: 7.9, whoThird: 7.0 },
      { month: '7M', weight: 7.9, whoMedian: 8.3, whoThird: 7.3 },
      { month: '8M', weight: 7.9, whoMedian: 8.6, whoThird: 7.6 },
      { month: '9M', weight: 7.4, whoMedian: 8.9, whoThird: 7.8 }
    ],
    status: 'Pending'
  }
];

// Get all pending referrals (automatic seed if empty)
const getPendingReferrals = async (req, res) => {
  try {
    let referrals = await Referral.find({ status: 'Pending' }).sort({ createdAt: 1 });
    
    // Auto-seed if database is empty for testing out-of-the-box
    if (referrals.length === 0) {
      const allReferrals = await Referral.find();
      if (allReferrals.length === 0) {
        await Referral.insertMany(MOCK_REFERRALS);
        referrals = await Referral.find({ status: 'Pending' }).sort({ createdAt: 1 });
      }
    }
    
    res.status(200).json(referrals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// Submit assessment for a referral
const submitAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const { diagnosis, treatment, specialistReferral, reviewDate } = req.body;

    const referralItem = await Referral.findById(id);
    if (!referralItem) {
      return res.status(404).json({ msg: 'Referral not found.' });
    }

    referralItem.status = 'Reviewed';
    referralItem.assessment = {
      diagnosis,
      treatment,
      specialistReferral,
      reviewDate,
      reviewedAt: new Date()
    };

    await referralItem.save();
    res.status(200).json({ success: true, msg: 'Assessment saved successfully.', referral: referralItem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// Reset all referrals for testing/demo purposes
const resetReferrals = async (req, res) => {
  try {
    await Referral.deleteMany();
    await Referral.insertMany(MOCK_REFERRALS);
    const referrals = await Referral.find({ status: 'Pending' }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, msg: 'Referral data reset successfully.', referrals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

module.exports = {
  getPendingReferrals,
  submitAssessment,
  resetReferrals
};
