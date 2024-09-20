// backend/controllers/rsvpController.js
const RSVP = require('../models/RSVP');
const Event = require('../models/Event');

exports.rsvpEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Check if already RSVP'd
    const existingRSVP = await RSVP.findOne({ event: eventId, user: userId });
    if (existingRSVP) return res.status(400).json({ message: 'Already RSVP\'d to this event' });

    // Check max attendees
    const currentRSVPs = await RSVP.countDocuments({ event: eventId, status: 'confirmed' });
    if (currentRSVPs >= event.maxAttendees) {
      return res.status(400).json({ message: 'Event is full' });
    }

    const rsvp = new RSVP({ event: eventId, user: userId });
    await rsvp.save();

    // Add user to event's attendees
    event.attendees.push(userId);
    await event.save();

    res.status(201).json(rsvp);
  } catch (err) {
    next(err);
  }
};

exports.cancelRSVP = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    const rsvp = await RSVP.findOne({ event: eventId, user: userId });
    if (!rsvp) return res.status(404).json({ message: 'RSVP not found' });

    rsvp.status = 'cancelled';
    await rsvp.save();

    // Remove user from event's attendees
    const event = await Event.findById(eventId);
    event.attendees = event.attendees.filter(attendee => attendee.toString() !== userId);
    await event.save();

    res.json({ message: 'RSVP cancelled' });
  } catch (err) {
    next(err);
  }
};

exports.getUserRSVPs = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const rsvps = await RSVP.find({ user: userId, status: 'confirmed' }).populate('event');
    res.json(rsvps);
  } catch (err) {
    next(err);
  }
};
