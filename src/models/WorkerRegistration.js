const mongoose = require('mongoose');

const workerRegistrationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  firebaseUid: String,
  skills: [String],
  availability: [String],
  isVerified: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0
  },
  totalJobs: {
    type: Number,
    default: 0
  },
  completedJobs: {
    type: Number,
    default: 0
  },
  profilePhoto: String,
  nidFront: String,
  nidBack: String,
  nidNumber: String
}, {
  timestamps: true,
  collection: 'workerRegistration'
});

module.exports = mongoose.model('WorkerRegistration', workerRegistrationSchema);
