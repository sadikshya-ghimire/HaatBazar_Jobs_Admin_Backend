const mongoose = require('mongoose');

const existingUserSchema = new mongoose.Schema({
  email: String,
  phoneNumber: String,
  password: String,
  displayName: String,
  userType: {
    type: String,
    enum: ['worker', 'employer', null]
  },
  profileComplete: {
    type: Boolean,
    default: false
  },
  firebaseUid: String
}, {
  timestamps: true,
  collection: 'users'
});

module.exports = mongoose.model('ExistingUser', existingUserSchema);
