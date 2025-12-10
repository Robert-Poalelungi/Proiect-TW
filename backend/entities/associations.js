import Eveniment from "./Eveniment.js";
import GrupEvenimente from "./GrupEvenimente.js";
import Participant from "./Participant.js";

export const configureAssociations = () => {
  GrupEvenimente.hasMany(Eveniment, { foreignKey: "idGrup", as: "Events", onDelete: "CASCADE" });
  Eveniment.belongsTo(GrupEvenimente, { foreignKey: "idGrup", as: "Group" });

  Eveniment.hasMany(Participant, { foreignKey: "idEveniment", as: "Participants", onDelete: "CASCADE" });
  Participant.belongsTo(Eveniment, { foreignKey: "idEveniment", as: "Event" });
};

export default configureAssociations;
