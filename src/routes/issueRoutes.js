const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const { protect } = require('../middleware/auth');

// Get all issues (admin only)
router.get('/', protect, async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.json(issues);
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get issue by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    res.json(issue);
  } catch (error) {
    console.error('Error fetching issue:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new issue (can be called from mobile app or admin panel)
router.post('/', async (req, res) => {
  try {
    const issue = new Issue(req.body);
    await issue.save();
    res.status(201).json(issue);
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update issue status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status, adminNotes, resolvedBy } = req.body;
    const updateData = { status, updatedAt: Date.now() };
    
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }
    
    if (status === 'resolved' || status === 'closed') {
      updateData.resolvedAt = Date.now();
      if (resolvedBy) {
        updateData.resolvedBy = resolvedBy;
      }
    }
    
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    
    res.json(issue);
  } catch (error) {
    console.error('Error updating issue:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update issue priority
router.patch('/:id/priority', protect, async (req, res) => {
  try {
    const { priority } = req.body;
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { priority, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    
    res.json(issue);
  } catch (error) {
    console.error('Error updating priority:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete issue
router.delete('/:id', protect, async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    console.error('Error deleting issue:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
