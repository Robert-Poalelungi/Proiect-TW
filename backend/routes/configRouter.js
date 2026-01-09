import express from "express";
import db from "../dbConfig.js";
import configureAssociations from "../entities/associations.js";

const configRouter = express.Router();

// GET /api/config/init -> sincronizeaza schema fara a sterge datele
configRouter.get("/init", async (req, res) => {
  try {
    configureAssociations();
    await db.sync({ force: false });
    res.status(200).json({ success: true, message: "Baza de date sincronizată" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/config/reset -> recreeaza schema (sterge toate datele!)
configRouter.get("/reset", async (req, res) => {
  try {
    configureAssociations();
    await db.sync({ force: true });
    res.status(200).json({ success: true, message: "Baza de date a fost resetată" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/config/status -> verifica conexiunea la DB
configRouter.get("/status", async (req, res) => {
  try {
    await db.authenticate();
    res.status(200).json({ success: true, message: "Conexiune DB OK" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default configRouter;
