import { DataTypes } from "sequelize";
import db from "../dbConfig.js";

const GrupEvenimente = db.define("GrupEvenimente", {
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
  creatLa: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

export default GrupEvenimente;
