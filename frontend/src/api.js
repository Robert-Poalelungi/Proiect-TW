const API_BASE = "/api";

// Helper generic pentru request-uri JSON catre backend
async function request(path, options = {}) {
  const mergedHeaders = Object.assign({ "Content-Type": "application/json" }, options.headers || {});
  const fetchOptions = Object.assign({}, options, { headers: mergedHeaders });
  const res = await fetch(`${API_BASE}${path}`, fetchOptions);

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

export const obtineGrupuri = () => request("/grupuri");

export const creeazaGrup = (payload) =>
  request("/grupuri", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const inscrieLaEveniment = (payload) =>
  request("/inscriere", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const obtineEveniment = (eventId) => request(`/evenimente/${eventId}`);

export const obtineParticipanti = (eventId) => request(`/evenimente/${eventId}/participants`);

export const cautaLocatie = (query) => request(`/extern/locatie?q=${encodeURIComponent(query)}`);

export const stergeEveniment = (eventId) =>
  request(`/evenimente/${eventId}`, {
    method: "DELETE",
  });

export const stergeGrup = (groupId) =>
  request(`/grupuri/${groupId}`, {
    method: "DELETE",
  });

export const adaugaEvenimenteLaGrup = (groupId, evenimente) =>
  request(`/grupuri/${groupId}/evenimente`, {
    method: "POST",
    body: JSON.stringify({ evenimente }),
  });

export const exportaEvenimentCsv = async (eventId) => {
  const res = await fetch(`${API_BASE}/export/eveniment/${eventId}`);
  if (!res.ok) throw new Error("Nu s-a putut exporta CSV-ul evenimentului.");
  return res;
};

export const exportaGrupCsv = async (groupId) => {
  const res = await fetch(`${API_BASE}/export/grup/${groupId}`);
  if (!res.ok) throw new Error("Nu s-a putut exporta CSV-ul grupului.");
  return res;
};
