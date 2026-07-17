const Child = require('../models/Child');

// 1. දරුවන් ලියාපදිංචි කිරීමේ ෆන්ක්ෂන් එක
const registerChild = async (req, res) => {
  try {
    const { name, dob, gender, birthWeight, birthHeight, motherName, phone, address } = req.body;

    // අනිවාර්ය Fields හිස්දැයි පරීක්ෂා කිරීම
    if (!name || !dob || !motherName || !phone) {
      return res.status(400).json({ msg: 'Please fill in all required fields.' });
    }

    // 🛠️ 1. දරුවාගේ උපන් දිනයෙන් (DOB) වර්ෂය පමණක් වෙන් කර ගැනීම
    const birthDateObj = new Date(dob);
    const birthYear = birthDateObj.getFullYear(); // උදා: 2025 හෝ 2026

    // 🛠️ 10000 ත් 99999 ත් අතර සසම්භාවී (Random) ඉලක්කම් 5ක අංකයක් උත්පාදනය කිරීම
    const randomNumber = Math.floor(10000 + Math.random() * 90000); 

    // 🛠️ ස්ත්‍රී/පුරුෂ භාවය අනුව මැද අංකය 1 (Male) හෝ 2 (Female) ලෙස තීරණය කිරීම
    const genderCode = gender === 'Male' ? 1 : 2;

    // 🛠️ ඔබ ඉල්ලූ නිවැරදිම නව ආකෘතිය: SL-2026-1-59986 හෝ SL-2026-2-59986
    const digitalHealthId = `SL-${birthYear}-${genderCode}-${randomNumber}`;

    const newChild = new Child({
      digitalHealthId, // අලුතින්ම සකස් කළ ID එක Database එකට එකතු වේ
      name, 
      dob,
      gender,
      birthWeight,
      birthHeight,
      motherName,
      phone,
      address
    });

    await newChild.save();
    res.status(201).json({ success: true, msg: 'Child registered successfully.', child: newChild });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// 2. දරුවන්ගේ ලේඛනය (List) ලබාගැනීමේ ෆන්ක්ෂන් එක
const getChildren = async (req, res) => {
  try {
    // Database එකේ ඉන්න සියලුම දරුවන්ගේ විස්තර අලුත්ම අය මුලට එන සේ (createdAt: -1) ලබාගනී
    const children = await Child.find().sort({ createdAt: -1 }); 
    res.status(200).json(children);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// ⚠️ routes වලට පාවිච්චි කරන්න මේ functions දෙකම export කර ඇත
module.exports = { 
  registerChild, 
  getChildren 
};