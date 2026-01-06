import express from "express";
import { gasesteEvenimentDupaId } from "../dataAccess/EvenimentDA.js";
import { extindeGrup, gasesteGrup } from "../dataAccess/GrupEvenimenteDA.js";

const exportRouter = express.Router();

const trimiteCsv = (res, filename, lines) => {
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
  res.send(lines.join("\n"));
};

exportRouter.get("/eveniment/:id", async (req, res) => {
  const ev = await gasesteEvenimentDupaId(req.params.id);
  if (!ev) return res.status(404).json({ error: "Evenimentul nu există." });

  const lines = ["Nume,Inscris La"];
  const participants = ev.Participants || [];
  participants.forEach((p) => {
    lines.push(`${p.nume},${p.inscrisLa}`);
  });

  trimiteCsv(res, `eveniment-${ev.id}.csv`, lines);
});

exportRouter.get("/grup/:id", async (req, res) => {
  const group = await gasesteGrup(req.params.id);
  if (!group) return res.status(404).json({ error: "Grupul nu există." });

  const expanded = await extindeGrup(group);
  const lines = ["Eveniment,Nume,Inscris La"];

  expanded.Events.forEach((ev) => {
    const participants = ev.Participants || [];
    participants.forEach((p) => {
      lines.push(`${ev.nume},${p.nume},${p.inscrisLa}`);
    });
  });

  trimiteCsv(res, `grup-${group.id}.csv`, lines);
});

export default exportRouter;
