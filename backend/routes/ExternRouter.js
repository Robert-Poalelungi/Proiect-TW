import express from "express";
import fetch from "node-fetch";

const externRouter = express.Router();

// GET /api/extern/locatie -> geocodare simpla prin Nominatim (OpenStreetMap)
externRouter.get("/locatie", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Parametrul q este obligatoriu." });

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "prezente-app/1.0",
      },
    });

    if (!response.ok) {
      return res.status(502).json({ error: "Eroare la serviciul de geocodare." });
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      return res.status(404).json({ error: "Nu am găsit locația." });
    }

    const { lat, lon, display_name } = data[0];
    return res.json({ lat: Number(lat), lon: Number(lon), adresa: display_name });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Eroare la geocodare." });
  }
});

export default externRouter;
