const express = require('express');
const router = express.Router();
const ExistingUser = require('../models/ExistingUser');
const WorkerRegistration = require('../models/WorkerRegistration');
const EmployerRegistration = require('../models/EmployerRegistration');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/users
// @desc    Get all approved/verified users
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const users = await ExistingUser.find({ userType: { $ne: null } }).sort({ createdAt: -1 });
    
    // Enrich user data and filter only verified users
    const enrichedUsers = await Promise.all(users.map(async (user) => {
      let additionalData = {};
      let isVerified = false;
      
      if (user.userType === 'worker') {
        const workerData = await WorkerRegistration.findOne({ userId: user._id });
        if (workerData) {
          isVerified = workerData.isVerified;
          additionalData = {
            // All worker registration fields
            skills: workerData.skills,
            availability: workerData.availability,
            rating: workerData.rating,
            totalJobs: workerData.totalJobs,
            completedJobs: workerData.completedJobs,
            isVerified: workerData.isVerified,
            profilePhoto: workerData.profilePhoto,
            nidFront: workerData.nidFront,
            nidBack: workerData.nidBack,
            nidNumber: workerData.nidNumber,
            firebaseUid: workerData.firebaseUid,
            location: 'Not specified',
            registrationData: workerData // Send entire registration object
          };
        }
      } else if (user.userType === 'employer') {
        const employerData = await EmployerRegistration.findOne({ userId: user._id });
        if (employerData) {
          isVerified = employerData.isVerified;
          additionalData = {
            // All employer registration fields
            fullName: employerData.fullName,
            email: employerData.email,
            phoneNumber: employerData.phoneNumber,
            company: employerData.companyName,
            companyName: employerData.companyName,
            address: employerData.address,
            city: employerData.city,
            district: employerData.district,
            location: `${employerData.city || ''}, ${employerData.district || ''}`.trim() || 'Not specified',
            phone: employerData.phoneNumber,
            rating: employerData.rating,
            totalJobsPosted: employerData.totalJobsPosted,
            activeJobs: employerData.activeJobs,
            jobsCompleted: employerData.totalJobsPosted,
            isVerified: employerData.isVerified,
            profilePhoto: employerData.profilePhoto,
            nidFront: employerData.nidFront,
            nidBack: employerData.nidBack,
            nidNumber: employerData.nidNumber,
            firebaseUid: employerData.firebaseUid,
            registrationData: employerData // Send entire registration object
          };
        }
      }
      
      // Only return verified users
      if (!isVerified) {
        return null;
      }
      
      return {
        _id: user._id,
        name: user.displayName,
        email: user.email || '',
        phone: user.phoneNumber || additionalData.phone || '',
        type: user.userType,
        status: 'active',
        createdAt: user.createdAt,
        ...additionalData
      };
    }));
    
    // Filter out null values (unverified users)
    const verifiedUsers = enrichedUsers.filter(user => user !== null);
    
    res.json(verifiedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/pending
// @desc    Get pending/unverified users
// @access  Private/Admin
router.get('/pending', protect, admin, async (req, res) => {
  try {
    const users = await ExistingUser.find({ 
      userType: { $ne: null }
    }).sort({ createdAt: -1 });
    
    // Enrich user data and filter only unverified users
    const enrichedUsers = await Promise.all(users.map(async (user) => {
      let additionalData = {};
      let isVerified = false;
      
      if (user.userType === 'worker') {
        const workerData = await WorkerRegistration.findOne({ userId: user._id });
        if (workerData) {
          isVerified = workerData.isVerified;
          additionalData = {
            // All worker registration fields
            skills: workerData.skills,
            availability: workerData.availability,
            rating: workerData.rating,
            totalJobs: workerData.totalJobs,
            completedJobs: workerData.completedJobs,
            profilePhoto: workerData.profilePhoto,
            nidFront: workerData.nidFront,
            nidBack: workerData.nidBack,
            nidNumber: workerData.nidNumber,
            firebaseUid: workerData.firebaseUid,
            location: 'Not specified',
            registrationData: workerData // Send entire registration object
          };
        }
      } else if (user.userType === 'employer') {
        const employerData = await EmployerRegistration.findOne({ userId: user._id });
        if (employerData) {
          isVerified = employerData.isVerified;
          additionalData = {
            // All employer registration fields
            fullName: employerData.fullName,
            email: employerData.email,
            phoneNumber: employerData.phoneNumber,
            company: employerData.companyName,
            companyName: employerData.companyName,
            address: employerData.address,
            city: employerData.city,
            district: employerData.district,
            location: `${employerData.city || ''}, ${employerData.district || ''}`.trim() || 'Not specified',
            phone: employerData.phoneNumber,
            profilePhoto: employerData.profilePhoto,
            nidFront: employerData.nidFront,
            nidBack: employerData.nidBack,
            nidNumber: employerData.nidNumber,
            firebaseUid: employerData.firebaseUid,
            registrationData: employerData // Send entire registration object
          };
        }
      }
      
      // Only return unverified users (pending approval)
      if (isVerified) {
        return null;
      }
      
      return {
        _id: user._id,
        name: user.displayName,
        email: user.email || '',
        phone: user.phoneNumber || additionalData.phone || '',
        type: user.userType,
        status: 'pending',
        createdAt: user.createdAt,
        location: additionalData.location || 'Not specified',
        ...additionalData
      };
    }));
    
    // Filter out null values (verified users)
    const pendingUsers = enrichedUsers.filter(user => user !== null);
    
    res.json(pendingUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/users/:id/approve
// @desc    Approve user (set isVerified to true)
// @access  Private/Admin
router.put('/:id/approve', protect, admin, async (req, res) => {
  try {
    const user = await ExistingUser.findById(req.params.id);
    if (user) {
      // Update the registration collection to mark as verified
      if (user.userType === 'worker') {
        await WorkerRegistration.findOneAndUpdate(
          { userId: user._id },
          { isVerified: true }
        );
      } else if (user.userType === 'employer') {
        await EmployerRegistration.findOneAndUpdate(
          { userId: user._id },
          { isVerified: true }
        );
      }
      
      res.json({ message: 'User approved successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/users/:id/suspend
// @desc    Suspend user (set isVerified to false)
// @access  Private/Admin
router.put('/:id/suspend', protect, admin, async (req, res) => {
  try {
    const user = await ExistingUser.findById(req.params.id);
    if (user) {
      // Update the registration collection to mark as not verified
      if (user.userType === 'worker') {
        await WorkerRegistration.findOneAndUpdate(
          { userId: user._id },
          { isVerified: false }
        );
      } else if (user.userType === 'employer') {
        await EmployerRegistration.findOneAndUpdate(
          { userId: user._id },
          { isVerified: false }
        );
      }
      
      res.json({ message: 'User suspended successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/users/:id/activate
// @desc    Activate user (set isVerified to true)
// @access  Private/Admin
router.put('/:id/activate', protect, admin, async (req, res) => {
  try {
    const user = await ExistingUser.findById(req.params.id);
    if (user) {
      // Update the registration collection to mark as verified
      if (user.userType === 'worker') {
        await WorkerRegistration.findOneAndUpdate(
          { userId: user._id },
          { isVerified: true }
        );
      } else if (user.userType === 'employer') {
        await EmployerRegistration.findOneAndUpdate(
          { userId: user._id },
          { isVerified: true }
        );
      }
      
      res.json({ message: 'User activated successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const user = await ExistingUser.findById(req.params.id);
    if (user) {
      // Delete associated registration data
      if (user.userType === 'worker') {
        await WorkerRegistration.findOneAndDelete({ userId: user._id });
      } else if (user.userType === 'employer') {
        await EmployerRegistration.findOneAndDelete({ userId: user._id });
      }
      
      await user.deleteOne();
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
