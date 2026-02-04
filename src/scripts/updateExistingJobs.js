const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const Job = require('../models/Job');

const updateExistingJobs = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Update all jobs that don't have isApproved field
    const result = await Job.updateMany(
      { isApproved: { $exists: false } },
      { $set: { isApproved: false } }
    );

    console.log(`Updated ${result.modifiedCount} jobs with isApproved field`);

    // Show all jobs
    const allJobs = await Job.find({});
    console.log('\nAll jobs in database:');
    allJobs.forEach(job => {
      console.log(`- ${job.title} (isApproved: ${job.isApproved})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updateExistingJobs();
