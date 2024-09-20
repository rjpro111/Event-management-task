// backend/controllers/eventController.js
const Event = require('../models/Event');
const RSVP = require('../models/RSVP');
const sendEmail = require('../utils/emailService');

// Create Event
exports.createEvent = async (req, res, next) => {
  try {
    const { title, description, date, location, eventType, maxAttendees, attendees } = req.body;
    const image = req.file ? req.file.path : null;

    const event = new Event({
      title,
      description,
      date,
      location,
      eventType,
      maxAttendees,
      image,
      creator: req.user.id,
      attendees: attendees || []  // Optional attendees array, default to empty
    });

    await event.save();
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
};

// Get All Events with Filters
exports.getEvents = async (req, res, next) => {
  try {
    const { date, location, eventType, page = 1, limit = 10 } = req.query;
    const query = {};

    if (date) {
      const eventDate = new Date(date);
      query.date = { $gte: eventDate };
    }

    if (location) query.location = { $regex: location, $options: 'i' };
    if (eventType) query.eventType = eventType;

    const events = await Event.find(query)
      .populate('creator', 'username email')
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Event.countDocuments(query);

    res.json({ events, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// Get Single Event
exports.getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('creator', 'username email');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    next(err);
  }
};

// Update Event
// backend/controllers/eventController.js

// ... (other controller functions)

/**
 * Update Event with Notifications
 */
exports.updateEvent = async (req, res, next) => {
  try {
    const { title, description, date, location, eventType, maxAttendees } = req.body;
    const image = req.file ? req.file.path : null;

    // Find the event by ID
    let event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Check if the user is the creator of the event
    if (event.creator.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to edit this event' });
    }

    // Update event fields
    event.title = title || event.title;
    event.description = description || event.description;
    event.date = date || event.date;
    event.location = location || event.location;
    event.eventType = eventType || event.eventType;
    event.maxAttendees = maxAttendees || event.maxAttendees;
    if (image) event.image = image;

    // Save the updated event
    await event.save();

    // Fetch all users who RSVP'd to the event
    const rsvps = await RSVP.find({ event: req.params.id }).populate('user', 'email');
    const emails = rsvps.map((rsvp) => rsvp.user.email);

    // Send notification email to each user
    const emailPromises = emails.map((email) =>
      sendEmail(
        email,
        'Event Update Notification',
        `Hello,

The event '${event.title}' you RSVP'd to has been updated. Please check the new details:

Title: ${event.title}
Description: ${event.description}
Date: ${new Date(event.date).toLocaleString()}
Location: ${event.location}

Thank you,
Event Management Team`
      )
    );

    await Promise.all(emailPromises); // Send all emails concurrently

    res.json({ message: 'Event updated and notifications sent', event });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// ... (other controller functions)


// Delete Event
exports.deleteEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.creator.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this event' });
    }

    await event.remove();
    res.json({ message: 'Event removed' });
  } catch (err) {
    next(err);
  }
};
