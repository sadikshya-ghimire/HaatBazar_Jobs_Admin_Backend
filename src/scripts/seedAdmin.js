const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

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
    const adminExists = await User.findOne({ email: 'admin@haatbazarjobs.com' });

    if (adminExists) {
      console.log('Admin user already exists');
      process.exit();
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@haatbazarjobs.com',
      password: 'admin123',
      phone: '+977-9800000000',
      location: 'Kathmandu',
      type: 'admin',
      status: 'active'
    });

    console.log('Admin user created successfully');
    console.log('Email: admin@haatbazarjobs.com');
    console.log('Password: admin123');
    
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
