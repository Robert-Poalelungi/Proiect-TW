import { DataTypes } from "sequelize";
import db from "../dbConfig.js";

const Eveniment = db.define("Eveniment", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  nume: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  inceput: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  sfarsit: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  cod: {
    type: DataTypes.STRING(16),
    allowNull: false,
    unique: true,
  },
  idGrup: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

export default Eveniment;
