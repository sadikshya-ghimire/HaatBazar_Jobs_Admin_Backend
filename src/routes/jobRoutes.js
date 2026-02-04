const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const WorkerJobOffer = require('../models/WorkerJobOffer');
const EmployerJobOffer = require('../models/EmployerJobOffer');
const ExistingUser = require('../models/ExistingUser');
const WorkerRegistration = require('../models/WorkerRegistration');
const EmployerRegistration = require('../models/EmployerRegistration');
const { protect, admin } = require('../middleware/auth');

// Helper function to get user profile photo
const getUserProfilePhoto = async (user) => {
  if (!user) return null;
  
  try {
    if (user.userType === 'worker') {
      const workerReg = await WorkerRegistration.findOne({ userId: user._id });
      return workerReg?.profilePhoto;
    } else if (user.userType === 'employer') {
      const employerReg = await EmployerRegistration.findOne({ userId: user._id });
      return employerReg?.profilePhoto;
    }
  } catch (error) {
    console.error('Error fetching profile photo:', error);
  }
  return null;
};

// @route   GET /api/jobs
// @desc    Get all approved jobs from all collections
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    // Fetch from all three collections
    const [jobs, workerJobs, employerJobs] = await Promise.all([
      Job.find({ isApproved: true }).populate('postedBy', 'name email type').sort({ createdAt: -1 }),
      WorkerJobOffer.find({ isApproved: true }).sort({ createdAt: -1 }),
      EmployerJobOffer.find({ isApproved: true }).sort({ createdAt: -1 })
    ]);

    // Get user info for worker and employer jobs
    const workerJobsWithUser = await Promise.all(workerJobs.map(async (job) => {
      const user = await ExistingUser.findOne({ firebaseUid: job.firebaseUid });
      return {
        _id: job._id,
        title: job.title,
        description: job.description,
        type: 'worker',
        status: job.status,
        urgent: false,
        location: `${job.area || ''}, ${job.district || ''}`.trim() || 'Not specified',
        budget: job.expectedSalary ? parseInt(job.expectedSalary) : null,
        skills: job.skills,
        createdAt: job.createdAt,
        isApproved: job.isApproved,
        postedBy: user ? { name: user.displayName, type: 'worker', _id: user._id } : null,
        collection: 'workerjoboffers'
      };
    }));

    const employerJobsWithUser = await Promise.all(employerJobs.map(async (job) => {
      const user = await ExistingUser.findOne({ firebaseUid: job.firebaseUid });
      return {
        _id: job._id,
        title: job.title,
        description: job.description,
        type: 'employer',
        status: job.status,
        urgent: job.markedUrgent || false,
        location: `${job.area || ''}, ${job.district || ''}`.trim() || 'Not specified',
        budget: job.budget ? parseInt(job.budget) : null,
        skills: job.requiredSkills,
        applicants: job.applicants || [],
        createdAt: job.createdAt,
        isApproved: job.isApproved,
        postedBy: user ? { name: user.displayName, type: 'employer', _id: user._id } : null,
        collection: 'employerjoboffers'
      };
    }));

    // Combine and sort by date
    const allJobs = [...jobs, ...workerJobsWithUser, ...employerJobsWithUser]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(allJobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/jobs/pending
// @desc    Get all pending jobs from all collections
// @access  Private/Admin
router.get('/pending', protect, admin, async (req, res) => {
  try {
    console.log('Fetching pending jobs from all collections...');
    
    // Fetch from all three collections
    const [jobs, workerJobs, employerJobs] = await Promise.all([
      Job.find({ isApproved: false }).populate('postedBy', 'name email type').sort({ createdAt: -1 }),
      WorkerJobOffer.find({ isApproved: false }).sort({ createdAt: -1 }),
      EmployerJobOffer.find({ isApproved: false }).sort({ createdAt: -1 })
    ]);

    console.log(`Found ${jobs.length} jobs, ${workerJobs.length} worker jobs, ${employerJobs.length} employer jobs`);

    // Get user info for worker and employer jobs
    const workerJobsWithUser = await Promise.all(workerJobs.map(async (job) => {
      const user = await ExistingUser.findOne({ firebaseUid: job.firebaseUid });
      return {
        _id: job._id,
        title: job.title,
        description: job.description,
        type: 'worker',
        status: job.status,
        urgent: false,
        location: `${job.area || ''}, ${job.district || ''}`.trim() || 'Not specified',
        budget: job.expectedSalary ? parseInt(job.expectedSalary) : null,
        skills: job.skills,
        createdAt: job.createdAt,
        isApproved: job.isApproved,
        postedBy: user ? { name: user.displayName, type: 'worker', _id: user._id } : null,
        collection: 'workerjoboffers'
      };
    }));

    const employerJobsWithUser = await Promise.all(employerJobs.map(async (job) => {
      const user = await ExistingUser.findOne({ firebaseUid: job.firebaseUid });
      return {
        _id: job._id,
        title: job.title,
        description: job.description,
        type: 'employer',
        status: job.status,
        urgent: job.markedUrgent || false,
        location: `${job.area || ''}, ${job.district || ''}`.trim() || 'Not specified',
        budget: job.budget ? parseInt(job.budget) : null,
        skills: job.requiredSkills,
        applicants: job.applicants || [],
        createdAt: job.createdAt,
        isApproved: job.isApproved,
        postedBy: user ? { name: user.displayName, type: 'employer', _id: user._id } : null,
        collection: 'employerjoboffers'
      };
    }));

    // Combine and sort by date
    const allJobs = [...jobs, ...workerJobsWithUser, ...employerJobsWithUser]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    console.log(`Returning ${allJobs.length} total pending jobs`);
    res.json(allJobs);
  } catch (error) {
    console.error('Error fetching pending jobs:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/jobs/all
// @desc    Get all jobs (approved and pending)
// @access  Private/Admin
router.get('/all', protect, admin, async (req, res) => {
  try {
    const jobs = await Job.find({})
      .populate('postedBy', 'name email type')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/jobs
// @desc    Create new job
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, type, urgent, location, budget } = req.body;

    const job = await Job.create({
      title,
      description,
      postedBy: req.user._id,
      type,
      urgent,
      location,
      budget
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/jobs/:id/approve
// @desc    Approve a job post
// @access  Private/Admin
router.put('/:id/approve', protect, admin, async (req, res) => {
  try {
    const { collection } = req.body; // Frontend should send which collection this job is from
    
    let job;
    if (collection === 'workerjoboffers') {
      job = await WorkerJobOffer.findById(req.params.id);
    } else if (collection === 'employerjoboffers') {
      job = await EmployerJobOffer.findById(req.params.id);
    } else {
      job = await Job.findById(req.params.id);
    }
    
    if (job) {
      job.isApproved = true;
      await job.save();
      res.json({ message: 'Job approved successfully', job });
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    console.error('Error approving job:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/jobs/:id/status
// @desc    Update job status
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const job = await Job.findById(req.params.id);
    
    if (job) {
      job.status = status;
      await job.save();
      res.json({ message: 'Job status updated successfully' });
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete job
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const { collection } = req.query; // Get collection from query params
    
    let job;
    if (collection === 'workerjoboffers') {
      job = await WorkerJobOffer.findById(req.params.id);
    } else if (collection === 'employerjoboffers') {
      job = await EmployerJobOffer.findById(req.params.id);
    } else {
      job = await Job.findById(req.params.id);
    }
    
    if (job) {
      await job.deleteOne();
      res.json({ message: 'Job deleted successfully' });
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
