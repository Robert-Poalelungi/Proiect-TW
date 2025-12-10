import { DataTypes } from "sequelize";
import db from "../dbConfig.js";

const Participant = db.define("Participant", {
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
  inscrisLa: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  idEveniment: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

export default Participant;
