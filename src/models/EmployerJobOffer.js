const mongoose = require('mongoose');

const employerJobOfferSchema = new mongoose.Schema({
  firebaseUid: String,
  title: String,
  description: String,
  requiredSkills: [String],
  area: String,
  district: String,
  budget: String,
  urgency: String,
  duration: String,
  markedUrgent: Boolean,
  status: {
    type: String,
    default: 'active'
  },
  applicants: [String],
  isApproved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'employerjoboffers'
});

module.exports = mongoose.model('EmployerJobOffer', employerJobOfferSchema);
