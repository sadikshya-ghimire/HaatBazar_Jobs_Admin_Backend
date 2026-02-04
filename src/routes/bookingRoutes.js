const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { protect, admin } = require('../middleware/auth');

// Get all bookings (Admin only)
router.get('/', protect, admin, async (req, res) => {
  try {
    console.log('Fetching all bookings...');
    const bookings = await Booking.find().sort({ createdAt: -1 });
    console.log(`Found ${bookings.length} bookings`);
    if (bookings.length > 0) {
      console.log('Sample booking:', JSON.stringify(bookings[0], null, 2));
    }
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
});

// Get pending bookings (Admin only)
router.get('/pending', protect, admin, async (req, res) => {
  try {
    const bookings = await Booking.find({ 
      $or: [
        { bookingStatus: 'pending' },
        { status: 'pending' },
        { status: 'accepted' }
      ],
      adminApproval: false
    }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching pending bookings:', error);
    res.status(500).json({ message: 'Error fetching pending bookings', error: error.message });
  }
});

// Get booking by ID (Admin only)
router.get('/:id', protect, admin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Error fetching booking', error: error.message });
  }
});

// Approve booking (Admin only)
router.put('/:id/approve', protect, admin, async (req, res) => {
  try {
    const { adminNotes } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        bookingStatus: 'approved',
        status: 'approved',
        adminApproval: true, // Use existing field
        // workerApproval remains false until worker accepts
        adminNotes: adminNotes || ''
      },
      { new: true }
    );
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    console.log('Booking approved by admin:', booking._id, 'adminApproval:', booking.adminApproval, 'workerApproval:', booking.workerApproval);
    res.json({ message: 'Booking approved successfully. Waiting for worker acceptance.', booking });
  } catch (error) {
    console.error('Error approving booking:', error);
    res.status(500).json({ message: 'Error approving booking', error: error.message });
  }
});

// Reject booking (Admin only)
router.put('/:id/reject', protect, admin, async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        bookingStatus: 'rejected',
        status: 'rejected',
        adminApproval: false, // Use existing field
        rejectionReason: rejectionReason || 'No reason provided'
      },
      { new: true }
    );
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    console.log('Booking rejected:', booking._id, 'Status:', booking.status, 'adminApproval:', booking.adminApproval);
    res.json({ message: 'Booking rejected successfully', booking });
  } catch (error) {
    console.error('Error rejecting booking:', error);
    res.status(500).json({ message: 'Error rejecting booking', error: error.message });
  }
});

// Update payment status (Admin only)
router.put('/:id/payment', protect, admin, async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    );
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json({ message: 'Payment status updated successfully', booking });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: 'Error updating payment status', error: error.message });
  }
});

// Delete booking (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: 'Error deleting booking', error: error.message });
  }
});

module.exports = router;
