const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// In-memory storage for groups, events, and participants
const eventGroups = [];
const events = new Map();

let groupCounter = 1;
let eventCounter = 1;

const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

const computeStatus = (event) => {
  const now = new Date();
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);

  if (now < start) return "CLOSED";
  if (now > end) return "CLOSED";
  return "OPEN";
};

// GET all event groups with their events
app.get("/api/event-groups", (req, res) => {
  const payload = eventGroups.map((group) => ({
    ...group,
    events: group.events.map((id) => {
      const ev = events.get(id);
      return {
        ...ev,
        status: computeStatus(ev),
      };
    }),
  }));

  res.json(payload);
});

// POST create group + events
app.post("/api/event-groups", (req, res) => {
  const { name, events: incomingEvents } = req.body || {};

  if (!name || !Array.isArray(incomingEvents) || incomingEvents.length === 0) {
    return res.status(400).json({ error: "Invalid payload. Provide name and events." });
  }

  const groupId = String(groupCounter++);
  const groupEventIds = [];

  incomingEvents.forEach((ev) => {
    const { name: eventName, startTime, endTime } = ev;
    if (!eventName || !startTime || !endTime) {
      return;
    }

    const eventId = String(eventCounter++);
    const eventObj = {
      id: eventId,
      groupId,
      name: eventName,
      startTime,
      endTime,
      code: generateCode(),
      participants: [],
    };

    groupEventIds.push(eventId);
    events.set(eventId, eventObj);
  });

  if (groupEventIds.length === 0) {
    return res.status(400).json({ error: "No valid events provided." });
  }

  const group = { id: groupId, name, events: groupEventIds, createdAt: new Date().toISOString() };
  eventGroups.push(group);

  res.status(201).json({
    group,
    events: groupEventIds.map((id) => ({ ...events.get(id), status: computeStatus(events.get(id)) })),
  });
});

// POST append events to existing group
app.post("/api/event-groups/:id/events", (req, res) => {
  const group = eventGroups.find((g) => g.id === req.params.id);
  const incomingEvents = req.body?.events;

  if (!group) {
    return res.status(404).json({ error: "Group not found." });
  }
  if (!Array.isArray(incomingEvents) || incomingEvents.length === 0) {
    return res.status(400).json({ error: "Provide at least one event." });
  }

  const created = [];
  incomingEvents.forEach((ev) => {
    const { name: eventName, startTime, endTime } = ev;
    if (!eventName || !startTime || !endTime) return;

    const eventId = String(eventCounter++);
    const eventObj = {
      id: eventId,
      groupId: group.id,
      name: eventName,
      startTime,
      endTime,
      code: generateCode(),
      participants: [],
    };
    events.set(eventId, eventObj);
    group.events.push(eventId);
    created.push({ ...eventObj, status: computeStatus(eventObj) });
  });

  if (created.length === 0) {
    return res.status(400).json({ error: "No valid events provided." });
  }

  res.status(201).json({ added: created, group });
});

// POST join event by code
app.post("/api/join", (req, res) => {
  const { code, name } = req.body || {};

  if (!code || !name) {
    return res.status(400).json({ error: "Code and name are required." });
  }

  const event = Array.from(events.values()).find((ev) => ev.code === code.toUpperCase());

  if (!event) {
    return res.status(404).json({ error: "Event not found." });
  }

  const status = computeStatus(event);
  if (status !== "OPEN") {
    return res.status(400).json({ error: "Event is not open." });
  }

  const participant = { name, joinedAt: new Date().toISOString() };
  event.participants.push(participant);

  res.json({ message: "Joined", event: { ...event, status } });
});

// GET event details
app.get("/api/events/:id", (req, res) => {
  const ev = events.get(req.params.id);
  if (!ev) {
    return res.status(404).json({ error: "Event not found." });
  }
  res.json({ ...ev, status: computeStatus(ev) });
});

// DELETE event
app.delete("/api/events/:id", (req, res) => {
  const ev = events.get(req.params.id);
  if (!ev) {
    return res.status(404).json({ error: "Event not found." });
  }

  // Remove event from map and from its group list
  events.delete(ev.id);
  const group = eventGroups.find((g) => g.id === ev.groupId);
  if (group) {
    group.events = group.events.filter((eid) => eid !== ev.id);
  }

  return res.json({ message: "Event deleted" });
});

// GET participants for event
app.get("/api/events/:id/participants", (req, res) => {
  const ev = events.get(req.params.id);
  if (!ev) {
    return res.status(404).json({ error: "Event not found." });
  }
  res.json(ev.participants);
});

// Export CSV for single event
app.get("/api/export/event/:id", (req, res) => {
  const ev = events.get(req.params.id);
  if (!ev) {
    return res.status(404).json({ error: "Event not found." });
  }

  const lines = ["Name,Joined At"];
  ev.participants.forEach((p) => {
    lines.push(`${p.name},${p.joinedAt}`);
  });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=event-${ev.id}.csv`);
  res.send(lines.join("\n"));
});

// Export CSV for group
app.get("/api/export/group/:id", (req, res) => {
  const group = eventGroups.find((g) => g.id === req.params.id);
  if (!group) {
    return res.status(404).json({ error: "Group not found." });
  }

  const lines = ["Event,Name,Joined At"];

  group.events.forEach((eventId) => {
    const ev = events.get(eventId);
    if (!ev) return;
    ev.participants.forEach((p) => {
      lines.push(`${ev.name},${p.name},${p.joinedAt}`);
    });
  });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=group-${group.id}.csv`);
  res.send(lines.join("\n"));
});

// DELETE group (removes contained events)
app.delete("/api/event-groups/:id", (req, res) => {
  const idx = eventGroups.findIndex((g) => g.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: "Group not found." });
  }

  const group = eventGroups[idx];
  group.events.forEach((eventId) => events.delete(eventId));
  eventGroups.splice(idx, 1);

  return res.json({ message: "Group deleted" });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Presence backend running on http://localhost:${PORT}`);
});
