import Eveniment from "./Eveniment.js";
import GrupEvenimente from "./GrupEvenimente.js";
import Participant from "./Participant.js";

export const configureAssociations = () => {
  // Un grup are multe evenimente; stergerea grupului cascada
  GrupEvenimente.hasMany(Eveniment, { foreignKey: "idGrup", as: "Events", onDelete: "CASCADE" });
  // Fiecare eveniment apartine unui grup
  Eveniment.belongsTo(GrupEvenimente, { foreignKey: "idGrup", as: "Group" });

  // Un eveniment are multi participanti; stergerea evenimentului cascada
  Eveniment.hasMany(Participant, { foreignKey: "idEveniment", as: "Participants", onDelete: "CASCADE" });
  // Fiecare participant apartine unui eveniment
  Participant.belongsTo(Eveniment, { foreignKey: "idEveniment", as: "Event" });
};

export default configureAssociations;
