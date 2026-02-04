const mongoose = require('mongoose');

const workerJobOfferSchema = new mongoose.Schema({
  firebaseUid: String,
  title: String,
  description: String,
  skills: [String],
  area: String,
  district: String,
  expectedSalary: String,
  availability: String,
  experience: String,
  status: {
    type: String,
    default: 'active'
  },
  isApproved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'workerjoboffers'
});

module.exports = mongoose.model('WorkerJobOffer', workerJobOfferSchema);
