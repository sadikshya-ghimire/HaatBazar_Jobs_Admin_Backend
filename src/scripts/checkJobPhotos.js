const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const checkJobPhotos = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    // Check workerjoboffers collection
    const workerJobsCollection = mongoose.connection.collection('workerjoboffers');
    const workerJobs = await workerJobsCollection.find({}).toArray();
    console.log(`=== Worker Job Offers ===`);
    workerJobs.forEach((job, i) => {
      console.log(`\n${i + 1}. ${job.title}`);
      console.log('   All fields:', Object.keys(job));
      // Check for any photo-related fields
      const photoFields = Object.keys(job).filter(key => 
        key.toLowerCase().includes('photo') || 
        key.toLowerCase().includes('image') || 
        key.toLowerCase().includes('picture')
      );
      if (photoFields.length > 0) {
        console.log('   Photo fields:', photoFields);
        photoFields.forEach(field => {
          console.log(`   ${field}:`, job[field]);
        });
      } else {
        console.log('   No photo fields found');
      }
    });

    // Check employerjoboffers collection
    const employerJobsCollection = mongoose.connection.collection('employerjoboffers');
    const employerJobs = await employerJobsCollection.find({}).toArray();
    console.log(`\n\n=== Employer Job Offers ===`);
    employerJobs.forEach((job, i) => {
      console.log(`\n${i + 1}. ${job.title}`);
      console.log('   All fields:', Object.keys(job));
      // Check for any photo-related fields
      const photoFields = Object.keys(job).filter(key => 
        key.toLowerCase().includes('photo') || 
        key.toLowerCase().includes('image') || 
        key.toLowerCase().includes('picture')
      );
      if (photoFields.length > 0) {
        console.log('   Photo fields:', photoFields);
        photoFields.forEach(field => {
          console.log(`   ${field}:`, job[field]);
        });
      } else {
        console.log('   No photo fields found');
      }
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkJobPhotos();
