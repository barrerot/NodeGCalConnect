require("dotenv").config(); // Load environment variables from .env
const express = require("express");
const { google } = require("googleapis");
const key = require("./credentials.json");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Define authentication scopes for Google Calendar API
const SCOPES = ["https://www.googleapis.com/auth/calendar"];

// Configure authentication using JWT from service account credentials
const auth = new google.auth.JWT({
  email: key.client_email,
  key: key.private_key,
  scopes: SCOPES,
});

// Create Google Calendar client instance
const calendar = google.calendar({ version: "v3", auth });

// Helper function to validate date strings in YYYY-MM-DD format
function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateString.match(regex)) return false;
  const date = new Date(dateString);
  const timestamp = date.getTime();
  if (typeof timestamp !== "number" || Number.isNaN(timestamp)) return false;
  return dateString === date.toISOString().split("T")[0];
}

// Route to get events from Google Calendar
app.get("/items", async (req, res) => {
  try {
    const { day, start, end, summary } = req.query;

    // Validate query parameters
    if (!day && (!start || !end)) {
      return res
        .status(400)
        .send(
          "Day parameter is required or both start and end parameters are required",
        );
    }

    // Determine time range for the query
    let timeMin, timeMax;
    if (day) {
      if (!isValidDate(day)) {
        return res.status(400).send("Invalid day format. Expected YYYY-MM-DD.");
      }
      const startOfDay = new Date(`${day}T00:00:00Z`);
      const endOfDay = new Date(`${day}T23:59:59Z`);
      timeMin = startOfDay.toISOString();
      timeMax = endOfDay.toISOString();
    } else {
      // Parse start and end dates in YYYY-MM-DD format
      if (!isValidDate(start) || !isValidDate(end)) {
        return res
          .status(400)
          .send("Invalid start or end date format. Expected YYYY-MM-DD.");
      }
      const startDate = new Date(`${start}T00:00:00Z`);
      const endDate = new Date(`${end}T23:59:59Z`);
      timeMin = startDate.toISOString();
      timeMax = endDate.toISOString();
    }

    // Set parameters for the events list query
    const filter = {
      calendarId: process.env.CALENDAR_ID,
      timeMin: timeMin,
      timeMax: timeMax,
      maxResults: 2500,
      singleEvents: true,
      orderBy: "startTime",
    };

    // Fetch events from Google Calendar
    const response = await calendar.events.list(filter);

    // Map events to a simplified structure
    const events = response.data.items.map((event) => ({
      summary: event.summary,
      start: event.start.dateTime ? new Date(event.start.dateTime).toLocaleString() : null,
      end: event.end.dateTime ? new Date(event.end.dateTime).toLocaleString() : null,
    }));

    // Filter events by summary if provided
    const filteredEvents = summary
      ? events.filter((event) =>
          event.summary && event.summary.toLowerCase().includes(summary.toLowerCase()),
        )
      : events;

    // Respond with the filtered events
    res.json(filteredEvents);
  } catch (error) {
    console.error("Error fetching events from Google Calendar:", error);
    res.status(500).send("Error fetching events from Google Calendar");
  }
});

// Route to create a new event in Google Calendar
app.post("/events", async (req, res) => {
  try {
    const { summary, description, location, startDateTime, endDateTime } =
      req.body;

    // Validate request body parameters
    if (!summary || !startDateTime || !endDateTime) {
      return res
        .status(400)
        .send("Summary, startDateTime and endDateTime are required");
    }

    // Define the event object
    const event = {
      summary: summary,
      description: description,
      location: location,
      start: {
        dateTime: new Date(startDateTime).toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: new Date(endDateTime).toISOString(),
        timeZone: "UTC",
      },
    };

    // Insert the new event into Google Calendar
    const response = await calendar.events.insert({
      calendarId: process.env.CALENDAR_ID,
      resource: event,
    });

    // Respond with the created event
    res.status(201).json(response.data);
  } catch (error) {
    console.error(
      "Error creating event in Google Calendar:",
      error.response ? error.response.data : error.message,
    );
    res.status(500).send("Error creating event in Google Calendar");
  }
});

// Route to update an existing event in Google Calendar
app.put("/events/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;
    const { summary, description, location, startDateTime, endDateTime } =
      req.body;

    // Validate request body and URL parameters
    if (!eventId || !summary || !startDateTime || !endDateTime) {
      return res
        .status(400)
        .send("Event ID, summary, startDateTime, and endDateTime are required");
    }

    // Define the updated event object
    const event = {
      summary: summary,
      description: description,
      location: location,
      start: {
        dateTime: new Date(startDateTime).toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: new Date(endDateTime).toISOString(),
        timeZone: "UTC",
      },
    };

    // Update the event in Google Calendar
    const response = await calendar.events.update({
      calendarId: process.env.CALENDAR_ID,
      eventId: eventId,
      resource: event,
    });

    // Respond with the updated event
    res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "Error updating event in Google Calendar:",
      error.response ? error.response.data : error.message,
    );
    res.status(500).send("Error updating event in Google Calendar");
  }
});

// Route to delete an existing event in Google Calendar
app.delete("/events/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;

    // Validate URL parameter
    if (!eventId) {
      return res.status(400).send("Event ID is required");
    }

    // Delete the event from Google Calendar
    await calendar.events.delete({
      calendarId: process.env.CALENDAR_ID,
      eventId: eventId,
    });

    // Respond with no content status
    res.status(204).send(); // No Content
  } catch (error) {
    console.error(
      "Error deleting event in Google Calendar:",
      error.response ? error.response.data : error.message,
    );
    res.status(500).send("Error deleting event in Google Calendar");
  }
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
