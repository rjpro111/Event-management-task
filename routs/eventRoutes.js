// backend/routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const {createEvent,getEvents,getEventById,updateEvent,deleteEvent} = require('../controllers/eventController');
const { protect } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/'); // Ensure this directory exists
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // e.g., 163234123.jpg
  }
});
const upload = multer({ storage });

// @route   POST /api/events
// @desc    Create a new event
// @access  Private
router.post('/', protect, upload.single('image'), createEvent);

// @route   GET /api/events
// @desc    Get all events with filters
// @access  Public
router.get('/', getEvents);

// @route   GET /api/events/:id
// @desc    Get single event by ID
// @access  Public
router.get('/:id', getEventById);

// @route   PUT /api/events/:id
// @desc    Update an event
// @access  Private
router.put('/:id', protect, upload.single('image'), updateEvent);

// @route   DELETE /api/events/:id
// @desc    Delete an event
// @access  Private
router.delete('/:id', protect, deleteEvent);

module.exports = router;
