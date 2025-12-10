import express from "express";
import {
  adaugaEvenimenteLaGrup,
  creeazaGrupCuEvenimente,
  extindeGrup,
  obtineGrupuri,
  stergeGrupDupaId,
} from "../dataAccess/GrupEvenimenteDA.js";
import { adaugaStatus } from "../utils/utils.js";

const grupEvenimenteRouter = express.Router();

grupEvenimenteRouter.get("/", async (req, res) => {
  try {
    const groups = await obtineGrupuri();
    const payload = await Promise.all(
      groups.map(async (group) => {
        const expanded = await extindeGrup(group);
        const expandedJson = expanded.toJSON();
        const eventsWithStatus = (expanded.Events || []).map((e) => adaugaStatus(e.toJSON()));
        const item = Object.assign({}, expandedJson, { evenimente: eventsWithStatus });
        delete item.Events;
        return item;
      })
    );

    res.json(payload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

grupEvenimenteRouter.post("/", async (req, res) => {
  try {
    const { nume, evenimente } = req.body || {};
    const result = await creeazaGrupCuEvenimente(nume, evenimente);
    res.status(201).json({
      grup: result.group,
      evenimente: result.events.map(adaugaStatus),
    });
  } catch (err) {
    res.status(400).json({ error: err.message || "Nu s-a putut crea grupul." });
  }
});

grupEvenimenteRouter.post("/:id/evenimente", async (req, res) => {
  try {
    const { evenimente } = req.body || {};
    const result = await adaugaEvenimenteLaGrup(req.params.id, evenimente);
    if (!result) return res.status(404).json({ error: "Grupul nu există." });

    res.status(201).json({
      adaugate: result.events.map(adaugaStatus),
      grup: result.group,
    });
  } catch (err) {
    res.status(400).json({ error: err.message || "Nu s-a putut adăuga evenimentul." });
  }
});

grupEvenimenteRouter.delete("/:id", async (req, res) => {
  const deleted = await stergeGrupDupaId(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Grupul nu există." });
  return res.json({ message: "Grup șters." });
});

export default grupEvenimenteRouter;
