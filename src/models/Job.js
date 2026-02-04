const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['worker', 'employer'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'completed'],
    default: 'active'
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  urgent: {
    type: Boolean,
    default: false
  },
  applicants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  location: {
    type: String,
    required: true
  },
  budget: {
    type: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Job', jobSchema);
