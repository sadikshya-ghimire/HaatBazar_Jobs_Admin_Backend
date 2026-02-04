const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const Job = require('../models/Job');
const ExistingUser = require('../models/ExistingUser');

const createTestJobs = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find a user to assign as job poster
    const users = await ExistingUser.find({ userType: { $ne: 'admin' } }).limit(2);
    
    if (users.length === 0) {
      console.log('No users found. Please create users first.');
      process.exit(1);
    }

    // Create test jobs
    const testJobs = [
      {
        title: 'Need Plumber for Kitchen Repair',
        description: 'Looking for an experienced plumber to fix kitchen sink and pipes. Urgent work needed.',
        postedBy: users[0]._id,
        type: users[0].userType === 'employer' ? 'employer' : 'worker',
        status: 'active',
        urgent: true,
        location: 'Kathmandu, Nepal',
        budget: 5000,
        isApproved: false // Pending approval
      },
      {
        title: 'Experienced Electrician Available',
        description: 'Professional electrician with 5 years experience. Available for residential and commercial work.',
        postedBy: users[0]._id,
        type: users[0].userType === 'worker' ? 'worker' : 'employer',
        status: 'active',
        urgent: false,
        location: 'Lalitpur, Nepal',
        budget: 3000,
        isApproved: false // Pending approval
      }
    ];

    if (users.length > 1) {
      testJobs.push({
        title: 'Construction Workers Needed',
        description: 'Need 5 construction workers for building project. 3 months contract.',
        postedBy: users[1]._id,
        type: users[1].userType === 'employer' ? 'employer' : 'worker',
        status: 'active',
        urgent: false,
        location: 'Bhaktapur, Nepal',
        budget: 25000,
        isApproved: false // Pending approval
      });
    }

    const createdJobs = await Job.insertMany(testJobs);
    console.log(`\nCreated ${createdJobs.length} test jobs:`);
    createdJobs.forEach(job => {
      console.log(`- ${job.title} (Type: ${job.type}, Approved: ${job.isApproved})`);
    });

    console.log('\nThese jobs are pending approval and will appear in the admin panel.');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createTestJobs();
