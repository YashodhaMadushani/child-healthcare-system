const mongoose = require('mongoose');

const ChildSchema = new mongoose.Schema({
  digitalHealthId: { type: String, required: true, unique: true },
  chdrNo: { type: String }, // CHDR / Health Book Number (legacy cross-ref)
  birthCertRegNo: { type: String }, // Birth Certificate Registration Number
  
  // Child Basic Info
  name: { type: String, required: true }, // Full Name
  nameWithInitials: { type: String },
  dob: { type: Date, required: true },
  gender: { type: String, required: true }, // Boy / Girl / Male / Female
  birthWeight: { type: Number, default: 0 }, // kg
  birthHeight: { type: Number, default: 0 }, // cm
  headCircumference: { type: Number, default: 0 }, // cm
  birthHospital: { type: String }, // Hospital / Birth Clinic Name
  
  // Parent / Guardian Details
  isMotherAbsent: { type: Boolean, default: false },
  guardianType: { type: String, default: 'Mother' }, // Mother, Father, Grandparent, Legal Guardian, Care Facility / Orphanage
  guardianName: { type: String }, // Primary Guardian Name
  guardianNic: { type: String }, // Primary Guardian NIC/Passport Number
  motherName: { type: String, required: true },
  phone: { type: String, required: true }, // Primary Contact Phone
  secondaryPhone: { type: String }, // Secondary Contact Number
  
  // Administrative & Location Info
  address: { type: String },
  mohArea: { type: String },
  phmRange: { type: String }, // Midwife Division / PHM Range
  gnDivision: { type: String }, // Grama Niladhari Division
  assignedClinicCenter: { type: String },
  
  // Medical Risk Indicators
  bloodGroup: { type: String, default: 'Unknown' },
  riskIndicators: {
    lowBirthWeight: { type: Boolean, default: false },
    prematureBirth: { type: Boolean, default: false },
    congenitalCondition: { type: Boolean, default: false },
    specialDoctorCare: { type: Boolean, default: false }
  },
  
  registeredBy: { type: String, default: "Staff Member" },
  observations: { type: String, default: "Child's activity levels are normal. Encouraged continuing complementary feeding practices with additional micro-nutrients." },
  growthRecords: [
    {
      date: { type: Date, default: Date.now },
      ageInterval: { type: String },
      weight: { type: Number },
      height: { type: Number },
      bmi: { type: Number }
    }
  ],
  vaccinations: [
    {
      name: { type: String },
      status: { type: String, default: 'Upcoming' }, // Completed, Due, Upcoming
      date: { type: String }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Child', ChildSchema);