// backend/utils/cronJob.js
const cron = require('node-cron');
const Event = require('../models/Event');
const RSVP = require('../models/RSVP');
const sendEmail = require('./emailService');

/**
 * Schedule a cron job to run every day at 8 AM
 */
cron.schedule('0 8 * * *', async () => {
  console.log('Running scheduled job: Sending event reminders');

  const now = new Date();
  const reminderTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

  try {
    // Find events happening in the next 24 hours
    const upcomingEvents = await Event.find({
      date: {
        $gte: reminderTime,
        $lte: new Date(reminderTime.getTime() + 60 * 60 * 1000), // +/- 1 hour window
      },
    });

    for (let event of upcomingEvents) {
      // Fetch all users who RSVP'd to the event
      const rsvps = await RSVP.find({ event: event._id }).populate('user', 'email');
      const emails = rsvps.map((rsvp) => rsvp.user.email);

      // Send reminder email to each user
      const emailPromises = emails.map((email) =>
        sendEmail(
          email,
          'Event Reminder',
          `Hello,

This is a reminder that the event '${event.title}' is happening tomorrow at ${new Date(event.date).toLocaleString()}.

Location: ${event.location}
Description: ${event.description}

We look forward to your participation!

Thank you,
Event Management Team`
        )
      );

      await Promise.all(emailPromises);
      console.log(`Reminders sent for event: ${event.title}`);
    }

    console.log('Scheduled job completed: Event reminders sent');
  } catch (error) {
    console.error('Error in scheduled cron job:', error);
  }
});
