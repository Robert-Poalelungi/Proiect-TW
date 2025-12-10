import express from "express";
import { stergeEvenimentDupaId, gasesteEvenimentDupaId, obtineParticipantiPentruEveniment } from "../dataAccess/EvenimentDA.js";
import { adaugaStatus } from "../utils/utils.js";

const evenimentRouter = express.Router();

evenimentRouter.get("/:id", async (req, res) => {
  const ev = await gasesteEvenimentDupaId(req.params.id);
  if (!ev) return res.status(404).json({ error: "Evenimentul nu există." });
  return res.json(adaugaStatus(ev.toJSON()));
});

evenimentRouter.get("/:id/participants", async (req, res) => {
  const participanti = await obtineParticipantiPentruEveniment(req.params.id);
  if (!participanti) return res.status(404).json({ error: "Evenimentul nu există." });
  return res.json(participanti);
});

evenimentRouter.delete("/:id", async (req, res) => {
  const deleted = await stergeEvenimentDupaId(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Evenimentul nu există." });
  return res.json({ message: "Eveniment șters." });
});

export default evenimentRouter;
