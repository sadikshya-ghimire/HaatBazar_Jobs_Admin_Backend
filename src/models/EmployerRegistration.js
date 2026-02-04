const mongoose = require('mongoose');

const employerRegistrationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  firebaseUid: String,
  fullName: String,
  email: String,
  phoneNumber: String,
  companyName: String,
  address: String,
  city: String,
  district: String,
  isVerified: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0
  },
  totalJobsPosted: {
    type: Number,
    default: 0
  },
  activeJobs: {
    type: Number,
    default: 0
  },
  profilePhoto: String,
  nidFront: String,
  nidBack: String,
  nidNumber: String
}, {
  timestamps: true,
  collection: 'employerRegistration'
});

module.exports = mongoose.model('EmployerRegistration', employerRegistrationSchema);
