const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Firebase UIDs
  employerFirebaseUid: String,
  workerFirebaseUid: String,
  
  // Legacy fields (for backward compatibility)
  employerUid: String,
  workerUid: String,
  
  // Job reference
  jobId: String,
  workerJobOfferId: String,
  
  // Job details
  jobTitle: String,
  jobDescription: String,
  
  // User information
  employerName: String,
  workerName: String,
  workerPhone: String,
  employerPhone: String,
  
  // Location
  area: String,
  district: String,
  location: mongoose.Schema.Types.Mixed,
  
  // Financial details
  budget: String,
  agreedRate: String,
  rateType: String,
  totalAmount: String,
  
  // Duration
  duration: String,
  workDuration: String,
  startDate: Date,
  endDate: Date,
  
  // Payment
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'pnding'],
    default: 'pending'
  },
  paymentMethod: String,
  paymentAmount: Number,
  
  // Booking status
  bookingStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled', 'accepted'],
    default: 'pending'
  },
  status: String, // Legacy field
  
  // Admin fields
  adminApproval: Boolean, // Use this existing field
  workerApproval: Boolean, // Use this existing field
  isApproved: Boolean, // Legacy field
  adminNotes: String,
  rejectionReason: String,
  notes: String
}, {
  timestamps: true,
  collection: 'WorkerBookingInfo', // Changed from 'bookings' to match actual collection name
  strict: false // Allow fields not in schema
});

module.exports = mongoose.model('Booking', bookingSchema);
