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
    const { day, start, end, summary } = req.query;

    // Verifica si los parámetros requeridos están presentes
    if (!day && (!start || !end)) {
      return res.status(400).send('Day parameter is required or both start and end parameters are required');
    }

    // Calcula los límites de tiempo
    let timeMin, timeMax;
    if (day) {
      const startOfDay = new Date(day);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(day);
      endOfDay.setHours(23, 59, 59, 999);
      timeMin = startOfDay.toISOString();
      timeMax = endOfDay.toISOString();
    } else {
      timeMin = new Date(start).toISOString();
      timeMax = new Date(end).toISOString();
    }

    // Construye el filtro para la consulta de eventos
    const filter = {
      calendarId: process.env.CALENDAR_ID,
      timeMin: timeMin,
      timeMax: timeMax,
      maxResults: 2500,
      singleEvents: true,
      orderBy: 'startTime',
    };

    // Realiza la consulta de eventos
    const response = await calendar.events.list(filter);

    // Formatea los eventos recuperados
    const events = response.data.items.map(event => ({
      summary: event.summary,
      start: new Date(event.start.dateTime).toLocaleString(),
      end: new Date(event.end.dateTime).toLocaleString(),
    }));

    // Filtra eventos basado en el resumen, si se proporciona
    const filteredEvents = summary ? events.filter(event => event.summary.toLowerCase().includes(summary.toLowerCase())) : events;

    // Responde con los eventos filtrados
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
