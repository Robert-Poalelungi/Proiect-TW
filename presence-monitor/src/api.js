const API_BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "Request failed");
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}

export const fetchGroups = () => request("/event-groups");

export const createGroup = (payload) =>
  request("/event-groups", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const joinEvent = (payload) =>
  request("/join", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getEvent = (eventId) => request(`/events/${eventId}`);

export const getParticipants = (eventId) => request(`/events/${eventId}/participants`);

export const deleteEvent = (eventId) =>
  request(`/events/${eventId}`, {
    method: "DELETE",
  });

export const deleteGroup = (groupId) =>
  request(`/event-groups/${groupId}`, {
    method: "DELETE",
  });

export const exportEventCsv = async (eventId) => {
  const res = await fetch(`${API_BASE}/export/event/${eventId}`);
  if (!res.ok) throw new Error("Nu s-a putut exporta CSV-ul evenimentului.");
  return res;
};

export const exportGroupCsv = async (groupId) => {
  const res = await fetch(`${API_BASE}/export/group/${groupId}`);
  if (!res.ok) throw new Error("Nu s-a putut exporta CSV-ul grupului.");
  return res;
};
