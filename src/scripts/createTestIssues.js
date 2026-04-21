require('dotenv').config();
const mongoose = require('mongoose');
const Issue = require('../models/Issue');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/haatbazaar_jobs';

const sampleIssues = [
  {
    userId: 'user123',
    userName: 'Rajesh Kumar',
    userEmail: 'rajesh.kumar@example.com',
    userType: 'worker',
    issueType: 'payment',
    priority: 'high',
    subject: 'Payment not received for completed job',
    description: 'I completed a plumbing job 5 days ago but haven\'t received the payment yet. The employer marked it as complete but the payment is still pending.',
    status: 'open'
  },
  {
    userId: 'user456',
    userName: 'Sita Sharma',
    userEmail: 'sita.sharma@example.com',
    userType: 'employer',
    issueType: 'booking',
    priority: 'medium',
    subject: 'Unable to cancel booking',
    description: 'I need to cancel a booking I made yesterday but the cancel button is not working in the app.',
    status: 'in-progress'
  },
  {
    userId: 'user789',
    userName: 'Ram Bahadur',
    userEmail: 'ram.bahadur@example.com',
    userType: 'worker',
    issueType: 'account',
    priority: 'urgent',
    subject: 'Account suspended without reason',
    description: 'My account was suddenly suspended and I cannot access it. I have not violated any terms. Please help me restore my account.',
    status: 'open'
  },
  {
    userId: 'user101',
    userName: 'Maya Thapa',
    userEmail: 'maya.thapa@example.com',
    userType: 'employer',
    issueType: 'job',
    priority: 'low',
    subject: 'How to edit job post after publishing?',
    description: 'I posted a job but realized I made a mistake in the description. How can I edit it?',
    status: 'resolved',
    adminNotes: 'Guided user through the edit process. Issue resolved.',
    resolvedBy: 'admin@haatbazarjobs.com',
    resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  },
  {
    userId: 'user202',
    userName: 'Krishna Poudel',
    userEmail: 'krishna.poudel@example.com',
    userType: 'worker',
    issueType: 'technical',
    priority: 'high',
    subject: 'App crashes when uploading photos',
    description: 'Every time I try to upload photos of my work, the app crashes. I\'m using Android 12.',
    status: 'in-progress',
    adminNotes: 'Forwarded to technical team. Investigating the issue.'
  },
  {
    userId: 'user303',
    userName: 'Gita Rai',
    userEmail: 'gita.rai@example.com',
    userType: 'employer',
    issueType: 'payment',
    priority: 'medium',
    subject: 'Payment method not working',
    description: 'I\'m trying to make a payment but my credit card is being declined even though it has sufficient balance.',
    status: 'open'
  },
  {
    userId: 'user404',
    userName: 'Hari Gurung',
    userEmail: 'hari.gurung@example.com',
    userType: 'worker',
    issueType: 'other',
    priority: 'low',
    subject: 'How to improve my profile visibility?',
    description: 'I want to get more job offers. What can I do to make my profile more visible to employers?',
    status: 'resolved',
    adminNotes: 'Provided tips on profile optimization and skill highlighting.',
    resolvedBy: 'admin@haatbazarjobs.com',
    resolvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
  }
];

async function createTestIssues() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing test issues
    await Issue.deleteMany({});
    console.log('Cleared existing issues');

    // Create new issues
    const createdIssues = await Issue.insertMany(sampleIssues);
    console.log(`Created ${createdIssues.length} test issues`);

    console.log('\nTest Issues Summary:');
    console.log('-------------------');
    createdIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.subject}`);
      console.log(`   User: ${issue.userName} (${issue.userType})`);
      console.log(`   Type: ${issue.issueType} | Priority: ${issue.priority} | Status: ${issue.status}`);
      console.log('');
    });

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error creating test issues:', error);
    process.exit(1);
  }
}

createTestIssues();
