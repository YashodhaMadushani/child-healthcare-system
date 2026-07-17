const Child = require('../models/Child');

// 1. Register a new child
const registerChild = async (req, res) => {
  try {
    const { name, dob, gender, birthWeight, birthHeight, motherName, phone, address } = req.body;

    // Validation: Check for required fields
    if (!name || !dob || !motherName || !phone) {
      return res.status(400).json({ msg: 'Please fill in all required fields.' });
    }

    // separate the year from the date of birth to use in the Digital Health ID
    const birthDateObj = new Date(dob);
    const birthYear = birthDateObj.getFullYear(); 

    // generate a random 5-digit number for the Digital Health ID
    const randomNumber = Math.floor(10000 + Math.random() * 90000); 

    // determine the gender code based on the provided gender (1 for Male,2 for Female)
    const genderCode = gender === 'Male' ? 1 : 2;

    // generate the Digital Health ID in the format SL-YYYY-G-RANDOMNUMBER
    const digitalHealthId = `SL-${birthYear}-${genderCode}-${randomNumber}`;

    const newChild = new Child({
      digitalHealthId, 
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

// 2. Get all registered children
const getChildren = async (req, res) => {
  try {
    // Fetch all children from the database, sorted by creation date in descending order
    const children = await Child.find().sort({ createdAt: -1 }); 
    res.status(200).json(children);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
};


module.exports = { 
  registerChild, 
  getChildren 
};