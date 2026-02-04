const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const checkAndUpdateJobs = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    // Check workerjoboffers collection
    const workerJobsCollection = mongoose.connection.collection('workerjoboffers');
    const workerJobs = await workerJobsCollection.find({}).toArray();
    console.log(`=== Worker Job Offers (${workerJobs.length} total) ===`);
    workerJobs.forEach((job, i) => {
      console.log(`${i + 1}. ${job.title}`);
      console.log(`   isApproved: ${job.isApproved}`);
      console.log(`   firebaseUid: ${job.firebaseUid}`);
      console.log('');
    });

    // Check employerjoboffers collection
    const employerJobsCollection = mongoose.connection.collection('employerjoboffers');
    const employerJobs = await employerJobsCollection.find({}).toArray();
    console.log(`\n=== Employer Job Offers (${employerJobs.length} total) ===`);
    employerJobs.forEach((job, i) => {
      console.log(`${i + 1}. ${job.title}`);
      console.log(`   isApproved: ${job.isApproved}`);
      console.log(`   firebaseUid: ${job.firebaseUid}`);
      console.log('');
    });

    // Update all jobs to set isApproved to false if it doesn't exist
    console.log('\n=== Updating jobs without isApproved field ===');
    
    const workerUpdate = await workerJobsCollection.updateMany(
      { isApproved: { $exists: false } },
      { $set: { isApproved: false } }
    );
    console.log(`Updated ${workerUpdate.modifiedCount} worker job offers`);

    const employerUpdate = await employerJobsCollection.updateMany(
      { isApproved: { $exists: false } },
      { $set: { isApproved: false } }
    );
    console.log(`Updated ${employerUpdate.modifiedCount} employer job offers`);

    // Show counts
    const pendingWorkerJobs = await workerJobsCollection.countDocuments({ isApproved: false });
    const pendingEmployerJobs = await employerJobsCollection.countDocuments({ isApproved: false });
    
    console.log(`\n=== Summary ===`);
    console.log(`Pending worker jobs: ${pendingWorkerJobs}`);
    console.log(`Pending employer jobs: ${pendingEmployerJobs}`);
    console.log(`Total pending jobs: ${pendingWorkerJobs + pendingEmployerJobs}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkAndUpdateJobs();
