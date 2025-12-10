import mysql from "mysql2/promise";
import env from "dotenv";
import db from "../dbConfig.js";
import configureAssociations from "./associations.js";

env.config();

async function Create_DB() {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      user: process.env.DB_USERNAME || "root",
      password: process.env.DB_PASSWORD || "",
    });
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_DATABASE || "prezente"}\``);
  } finally {
    if (conn) await conn.end();
  }
}

function FK_Config() {
  configureAssociations();
}

async function DB_Init() {
  await Create_DB();
  FK_Config();
}

export default DB_Init;
