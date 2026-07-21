const Child = require('../models/Child');

// Standard Sri Lankan National Immunization Schedule
const getInitialVaccinationSchedule = (dob) => [
  { name: "BCG (Birth)", status: "Completed", date: dob },
  { name: "Pentavalent 1 (2M)", status: "Due", date: "" },
  { name: "OPV 1 (2M)", status: "Due", date: "" },
  { name: "Pentavalent 2 (4M)", status: "Upcoming", date: "" },
  { name: "OPV 2 (4M)", status: "Upcoming", date: "" },
  { name: "Pentavalent 3 (6M)", status: "Upcoming", date: "" },
  { name: "OPV 3 (6M)", status: "Upcoming", date: "" },
  { name: "Measles & Rubella (9M)", status: "Upcoming", date: "" },
  { name: "MMR 1 (12M)", status: "Upcoming", date: "" },
  { name: "DPT Booster (18M)", status: "Upcoming", date: "" }
];

// 1. Register a new child
const registerChild = async (req, res) => {
  try {
    const { 
      name, 
      nameWithInitials,
      chdrNo,
      birthCertRegNo,
      dob, 
      gender, 
      birthWeight, 
      birthHeight, 
      headCircumference,
      birthHospital,
      isMotherAbsent,
      guardianType,
      guardianName,
      guardianNic,
      motherName, 
      phone, 
      secondaryPhone,
      address,
      mohArea,
      phmRange,
      gnDivision,
      assignedClinicCenter,
      bloodGroup,
      riskIndicators,
      registeredBy
    } = req.body;

    // Validation: Check for required fields
    if (!name || !dob || (!motherName && !guardianName) || !phone) {
      return res.status(400).json({ msg: 'Please fill in all required fields (Child Name, DOB, Guardian/Mother Name, Phone).' });
    }

    const birthDateObj = new Date(dob);
    const birthYear = birthDateObj.getFullYear(); 
    const randomNumber = Math.floor(10000 + Math.random() * 90000); 
    const genderCode = (gender === 'Male' || gender === 'Boy') ? 1 : 2;
    const digitalHealthId = `SL-${birthYear}-${genderCode}-${randomNumber}`;

    const newChild = new Child({
      digitalHealthId, 
      chdrNo: chdrNo || '',
      birthCertRegNo: birthCertRegNo || '',
      name, 
      nameWithInitials: nameWithInitials || '',
      dob,
      gender: gender || 'Boy',
      birthWeight: Number(birthWeight) || 0,
      birthHeight: Number(birthHeight) || 0,
      headCircumference: Number(headCircumference) || 0,
      birthHospital: birthHospital || '',
      isMotherAbsent: Boolean(isMotherAbsent),
      guardianType: guardianType || 'Mother',
      guardianName: guardianName || motherName || '',
      guardianNic: guardianNic || '',
      motherName: motherName || guardianName || 'N/A',
      phone,
      secondaryPhone: secondaryPhone || '',
      address: address || '',
      mohArea: mohArea || '',
      phmRange: phmRange || '',
      gnDivision: gnDivision || '',
      assignedClinicCenter: assignedClinicCenter || '',
      bloodGroup: bloodGroup || 'Unknown',
      riskIndicators: riskIndicators || {
        lowBirthWeight: false,
        prematureBirth: false,
        congenitalCondition: false,
        specialDoctorCare: false
      },
      registeredBy: registeredBy || "Staff Member",
      growthRecords: [
        {
          date: dob,
          ageInterval: "0M",
          weight: Number(birthWeight) || 3.0,
          height: Number(birthHeight) || 50.0,
          bmi: parseFloat(((Number(birthWeight) || 3.0) / (((Number(birthHeight) || 50.0)/100) * ((Number(birthHeight) || 50.0)/100))).toFixed(1))
        }
      ],
      vaccinations: getInitialVaccinationSchedule(dob)
    });

    await newChild.save();
    res.status(201).json({ success: true, msg: 'Child registered successfully.', child: newChild });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error: ' + err.message });
  }
};

// 2. Get all registered children
const getChildren = async (req, res) => {
  try {
    const children = await Child.find().sort({ createdAt: -1 }); 
    res.status(200).json(children);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// 3. Get child by ID
const getChildById = async (req, res) => {
  try {
    const child = await Child.findById(req.params.id);
    if (!child) {
      return res.status(404).json({ msg: 'Child not found' });
    }

    // Dynamic Mock/Initial data filler for legacy database entries if they lack growth data
    if (!child.growthRecords || child.growthRecords.length === 0) {
      child.growthRecords = [
        { date: child.dob, ageInterval: "0M", weight: child.birthWeight || 3.2, height: child.birthHeight || 49.8, bmi: 12.9 },
        { date: new Date(new Date(child.dob).setMonth(new Date(child.dob).getMonth() + 3)), ageInterval: "3M", weight: 5.8, height: 59.5, bmi: 16.4 },
        { date: new Date(new Date(child.dob).setMonth(new Date(child.dob).getMonth() + 6)), ageInterval: "6M", weight: 7.1, height: 65.8, bmi: 16.4 },
        { date: new Date(new Date(child.dob).setMonth(new Date(child.dob).getMonth() + 9)), ageInterval: "9M", weight: 8.0, height: 70.2, bmi: 16.2 },
        { date: new Date(new Date(child.dob).setMonth(new Date(child.dob).getMonth() + 12)), ageInterval: "12M", weight: 8.6, height: 74.0, bmi: 15.7 },
        { date: new Date(new Date(child.dob).setMonth(new Date(child.dob).getMonth() + 15)), ageInterval: "15M", weight: 9.1, height: 77.2, bmi: 15.3 },
        { date: new Date(new Date(child.dob).setMonth(new Date(child.dob).getMonth() + 18)), ageInterval: "18M", weight: 9.4, height: 80.5, bmi: 14.5 }
      ];
      await child.save();
    }

    if (!child.vaccinations || child.vaccinations.length === 0) {
      child.vaccinations = getInitialVaccinationSchedule(child.dob);
      await child.save();
    }

    res.status(200).json(child);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// 4. Add growth/weight update (log measurement)
const addGrowthRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { ageInterval, weight, height, bmi } = req.body;

    const child = await Child.findById(id);
    if (!child) {
      return res.status(404).json({ msg: 'Child not found' });
    }

    child.growthRecords.push({
      date: new Date(),
      ageInterval,
      weight,
      height,
      bmi
    });

    await child.save();
    res.status(200).json({ success: true, msg: 'Growth record added successfully.', child });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// 5. Update vaccination status
const updateVaccineStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { vaccineName, status, date } = req.body;

    const child = await Child.findById(id);
    if (!child) {
      return res.status(404).json({ msg: 'Child not found' });
    }

    // Find and update the vaccine item
    let found = false;
    child.vaccinations = child.vaccinations.map(v => {
      if (v.name === vaccineName) {
        found = true;
        return { ...v, status, date };
      }
      return v;
    });

    // If it is a new/custom vaccine not in list, push it
    if (!found) {
      child.vaccinations.push({ name: vaccineName, status, date });
    }

    await child.save();
    res.status(200).json({ success: true, msg: 'Vaccine status updated successfully.', child });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// 6. Update midwife observations
const updateObservations = async (req, res) => {
  try {
    const { id } = req.params;
    const { observations } = req.body;

    const child = await Child.findById(id);
    if (!child) {
      return res.status(404).json({ msg: 'Child not found' });
    }

    child.observations = observations;
    await child.save();
    res.status(200).json({ success: true, msg: 'Observations updated successfully.', child });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// 7. Record Clinic Visit (Bulk updates: growth measurements, vaccine statuses, observations, and doctor referral if active)
const recordClinicVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      weight,
      height,
      headCircumference,
      ageInterval,
      administeredVaccines, // array of names e.g., ["BCG (Birth)"]
      nextDueVaccineDate,
      referToDoctor,
      referralReason,
      referralNotes,
      thriposhaDistributed,
      thriposhaQuantity,
      nextClinicDate,
      observations,
      midwifeName
    } = req.body;

    const child = await Child.findById(id);
    if (!child) {
      return res.status(404).json({ msg: 'Child not found' });
    }

    // Update observations
    if (observations) {
      child.observations = observations;
    }

    // Push new growth record
    if (weight || height) {
      const calculatedBmi = (weight && height) 
        ? parseFloat((weight / ((height/100) * (height/100))).toFixed(1)) 
        : 15.0;
      child.growthRecords.push({
        date: new Date(),
        ageInterval: ageInterval || "Follow-up",
        weight: Number(weight) || 0,
        height: Number(height) || 0,
        bmi: calculatedBmi
      });
    }

    // Mark vaccines as administered
    if (administeredVaccines && Array.isArray(administeredVaccines)) {
      child.vaccinations = child.vaccinations.map(v => {
        if (administeredVaccines.includes(v.name)) {
          return { ...v, status: 'Completed', date: new Date().toISOString().split('T')[0] };
        }
        return v;
      });
    }

    await child.save();

    // Create doctor referral item if requested
    if (referToDoctor) {
      const Referral = require('../models/Referral');
      const birthDate = new Date(child.dob);
      const diffMs = Date.now() - birthDate.getTime();
      const ageMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.4375));
      const ageStr = `${ageMonths} Months`;
      
      const newReferral = new Referral({
        digitalHealthId: child.digitalHealthId,
        name: child.name,
        initials: child.nameWithInitials || child.name.split(' ').map(n => n[0]).join('').toUpperCase(),
        age: ageStr,
        gender: child.gender === 'Boy' ? 'Male' : 'Female',
        alertLevel: referralReason === 'Growth Retardation' ? 'Critical' : 'High',
        waitTime: 'Just now',
        alertReason: referralReason || 'Referral from MOH Clinic',
        village: child.mohArea || 'MOH Range',
        referredBy: midwifeName || 'MOH Midwife',
        vitals: {
          temp: "36.8°C",
          hr: "100 bpm",
          bp: "90/60 mmHg",
          tempAbnormal: false,
          hrAbnormal: false
        },
        percentiles: {
          weight: weight ? Math.min(Math.max(Math.floor((weight / 15) * 100), 5), 95) : 50,
          height: height ? Math.min(Math.max(Math.floor((height / 100) * 100), 5), 95) : 50
        },
        weightHistory: `${weight || 3.0}kg (Recorded during clinic visit)`,
        historyNotes: referralNotes || `Referred during routine clinic session. Observations: ${observations || 'None'}`,
        keyFacts: [
          { label: "Birth Weight", value: `${child.birthWeight} kg` },
          { label: "Blood Group", value: child.bloodGroup || "Unknown" },
          { label: "Phone", value: child.phone || "N/A" }
        ],
        chartData: child.growthRecords.map(r => ({
          month: r.ageInterval,
          weight: r.weight,
          whoMedian: r.weight * 1.1,
          whoThird: r.weight * 0.9
        })),
        status: 'Pending'
      });

      await newReferral.save();
    }

    res.status(200).json({ success: true, msg: 'Clinic visit recorded and synced successfully.', child });
  } catch (err) {
    console.error("Clinic visit recording error:", err);
    res.status(500).json({ msg: 'Server Error: ' + err.message });
  }
};

module.exports = { 
  registerChild, 
  getChildren,
  getChildById,
  addGrowthRecord,
  updateVaccineStatus,
  updateObservations,
  recordClinicVisit
};