const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const dns = require('dns');
require('dotenv').config();

// Use Google/Cloudflare DNS to resolve MongoDB Atlas SRV records reliably
dns.setServers(['8.8.8.8', '1.1.1.1']);

const seedUsers = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // Clear existing users to avoid duplicates during testing
  await User.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  const users = [
    { name: 'System Admin', email: 'admin@clinic.com', password: hashedPassword, role: 'admin' },
    { name: 'Dr. Silva', email: 'doctor@clinic.com', password: hashedPassword, role: 'doctor' },
    { name: 'Nurse Kamani', email: 'midwife@clinic.com', password: hashedPassword, role: 'midwife' },
    { name: 'Parent User', phone: '0761234567', password: hashedPassword, role: 'parent' }
  ];


  await User.insertMany(users);
  console.log('Database Seeded: Admin, Doctor, Midwife, and Parent created!');
  process.exit();
};

seedUsers();