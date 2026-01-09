import express from "express";
import { inscrieParticipantCuCod } from "../dataAccess/EvenimentDA.js";
import { adaugaStatus } from "../utils/utils.js";

const inscriereRouter = express.Router();

// POST /api/inscriere -> inscrie participant dupa cod si nume
inscriereRouter.post("/", async (req, res) => {
  const { cod, nume } = req.body || {};
  const result = await inscrieParticipantCuCod(cod, nume);

  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  return res.json({ message: "Participare înregistrată", eveniment: adaugaStatus(result.event.toJSON()) });
});

export default inscriereRouter;
