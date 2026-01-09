import { Sequelize } from "sequelize";
import env from "dotenv";

env.config();

// Config Sequelize pe baza variabilelor de mediu (.env) cu fallback-uri implicite
const db = new Sequelize({
  dialect: process.env.DB_DIALECT || "mysql",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
  database: process.env.DB_DATABASE || "prezente",
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "",
  logging: false,
  define: {
    timestamps: false,
    freezeTableName: true,
  },
});

export default db;
