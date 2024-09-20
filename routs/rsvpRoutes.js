// backend/routes/rsvpRoutes.js
const express = require('express');
const router = express.Router();
const { rsvpEvent, cancelRSVP, getUserRSVPs } = require('../controllers/rsvpController');
const { protect } = require('../middlewares/authMiddleware');

// @route   POST /api/rsvps/:id
// @desc    RSVP to an event
// @access  Private
router.post('/:id', protect,    );

// @route   DELETE /api/rsvps/:id
// @desc    Cancel RSVP
// @access  Private
router.delete('/:id', protect, cancelRSVP);

// @route   GET /api/rsvps
// @desc    Get all RSVPs of the logged-in user
// @access  Private
router.get('/', protect, getUserRSVPs);

module.exports = router;
