import cors from "cors";
import express from "express";
import env from "dotenv";
import configRouter from "./routes/configRouter.js";
import grupEvenimenteRouter from "./routes/GrupEvenimenteRouter.js";
import evenimentRouter from "./routes/EvenimentRouter.js";
import exportRouter from "./routes/exportRouter.js";
import inscriereRouter from "./routes/InscriereRouter.js";
import externRouter from "./routes/ExternRouter.js";
import DB_Init from "./entities/DB_Init.js";
import db from "./dbConfig.js";

env.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware global
app.use(cors());
app.use(express.json());

// Rute API
app.use("/api/config", configRouter);
app.use("/api/grupuri", grupEvenimenteRouter);
app.use("/api/evenimente", evenimentRouter);
app.use("/api/inscriere", inscriereRouter);
app.use("/api/export", exportRouter);
app.use("/api/extern", externRouter);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Handler de erori generic
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Eroare internă de server" });
});

// Porneste serverul: init DB, autentificare si sincronizare
const start = async () => {
  try {
    await DB_Init();
    await db.authenticate();
    console.log("Conexiune la baza de date reușită.");
    await db.sync({ force: false });
    console.log("Baza de date sincronizată.");
    app.listen(PORT, () => {
      console.log(`Server pornit pe http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Conexiunea la baza de date a eșuat:", err.message);
    process.exit(1);
  }
};

start();
