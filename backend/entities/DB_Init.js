import mysql from "mysql2/promise";
import env from "dotenv";
import db from "../dbConfig.js";
import configureAssociations from "./associations.js";

env.config();

async function Create_DB() {
  let conn;
  try {
    // Conexiune raw pentru a crea baza daca nu exista
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      user: process.env.DB_USERNAME || "root",
      password: process.env.DB_PASSWORD || "",
    });
    // Creeaza baza de date daca lipseste
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_DATABASE || "prezente"}\``);
  } finally {
    if (conn) await conn.end();
  }
}

function FK_Config() {
  // Configureaza asocierile Sequelize (FK-uri si aliasuri)
  configureAssociations();
}

async function DB_Init() {
  // Creeaza baza si configureaza FK-urile
  await Create_DB();
  FK_Config();
}

export default DB_Init;
