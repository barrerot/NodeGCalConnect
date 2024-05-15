require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const { google } = require('googleapis');
const key = require('./credentials.json');

const app = express();
const PORT = process.env.PORT || 3000;

// Define authentication scopes
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

// Configure authentication
const auth = new google.auth.JWT({
  email: key.client_email,
  key: key.private_key,
  scopes: SCOPES,
});

// Create Google Calendar client instance
const calendar = google.calendar({ version: 'v3', auth });

// Route to get events
app.get('/events', async (req, res) => {
  try {
    // Get query parameters
    const { day, start, end, summary } = req.query;

    // Check the validity of parameters
    if (!day && (!start || !end)) {
      return res.status(400).send('Day parameter is required or start and end parameters are required');
    }

    // Calculate time bounds
    let timeMin, timeMax;
    if (day) {
      const startOfDay = new Date(day);
      const endOfDay = new Date(day);
      endOfDay.setDate(endOfDay.getDate() + 1);
      timeMin = startOfDay.toISOString();
      timeMax = endOfDay.toISOString();
    } else {
      timeMin = new Date(start).toISOString();
      timeMax = new Date(end).toISOString();
    }

    // Build filter for events query
    const filter = {
      calendarId: process.env.CALENDAR_ID, // Use calendar ID from environment variables
      timeMin: timeMin,
      timeMax: timeMax,
      maxResults: 2500,
      singleEvents: true,
      orderBy: 'startTime',
    };

    // Perform events query
    const response = await calendar.events.list(filter);

    // Format retrieved events
    const events = response.data.items.map(event => ({
      summary: event.summary, // Keep event summary as it is in Google Calendar
      start: new Date(event.start.dateTime).toLocaleString(),
      end: new Date(event.end.dateTime).toLocaleString(),
    }));

    // Filter events based on summary (case-insensitive and substring search)
    const filteredEvents = events.filter(event => {
      return event.summary.toLowerCase().includes(summary.toLowerCase());
    });

    // Respond with filtered events
    res.json(filteredEvents);
  } catch (error) {
    console.error('Error fetching events from Google Calendar:', error);
    res.status(500).send('Error fetching events from Google Calendar');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Export the app for testing purposes
module.exports = app;
