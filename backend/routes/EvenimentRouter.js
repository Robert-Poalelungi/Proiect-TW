import express from "express";
import { stergeEvenimentDupaId, gasesteEvenimentDupaId, obtineParticipantiPentruEveniment } from "../dataAccess/EvenimentDA.js";
import { adaugaStatus } from "../utils/utils.js";

const evenimentRouter = express.Router();

// GET /api/events/:id -> detalii eveniment cu status calculat
evenimentRouter.get("/:id", async (req, res) => {
  const ev = await gasesteEvenimentDupaId(req.params.id);
  if (!ev) return res.status(404).json({ error: "Evenimentul nu există." });
  return res.json(adaugaStatus(ev.toJSON()));
});

// GET /api/events/:id/participants -> lista participanților la eveniment
evenimentRouter.get("/:id/participants", async (req, res) => {
  const participanti = await obtineParticipantiPentruEveniment(req.params.id);
  if (!participanti) return res.status(404).json({ error: "Evenimentul nu există." });
  return res.json(participanti);
});

// DELETE /api/events/:id -> șterge evenimentul
evenimentRouter.delete("/:id", async (req, res) => {
  const deleted = await stergeEvenimentDupaId(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Evenimentul nu există." });
  return res.json({ message: "Eveniment șters." });
});

export default evenimentRouter;
