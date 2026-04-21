const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const AdminInfo = require('../models/AdminInfo');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedAdmin = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const adminExists = await AdminInfo.findOne({ email: 'admin@haatbazarjobs.com' });

    if (adminExists) {
      console.log('Admin user already exists');
      console.log('Email: admin@haatbazarjobs.com');
      console.log('Password: admin123');
      process.exit();
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create admin user
    const admin = await AdminInfo.create({
      name: 'Admin',
      email: 'admin@haatbazarjobs.com',
      password: hashedPassword,
      role: 'admin'
    });

    console.log('Admin user created successfully!');
    console.log('Email: admin@haatbazarjobs.com');
    console.log('Password: admin123');
    console.log('\nYou can now login to the admin portal.');
    
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
