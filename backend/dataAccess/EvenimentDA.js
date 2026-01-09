import Eveniment from "../entities/Eveniment.js";
import Participant from "../entities/Participant.js";
import { calculeazaStatus } from "../utils/utils.js";

// Returneaza un eveniment dupa PK si include participantii asociati
export const gasesteEvenimentDupaId = async (evenimentId) => {
  return Eveniment.findByPk(evenimentId, {
    include: [{ model: Participant, as: "Participants" }],
  });
};

// Sterge un eveniment dupa id; intoarce null daca nu exista
export const stergeEvenimentDupaId = async (evenimentId) => {
  const eveniment = await Eveniment.findByPk(evenimentId);
  if (!eveniment) return null;
  await eveniment.destroy();
  return eveniment;
};

// Intoarce participantii unui eveniment sau null daca evenimentul lipseste
export const obtineParticipantiPentruEveniment = async (evenimentId) => {
  const eveniment = await Eveniment.findByPk(evenimentId, {
    include: [{ model: Participant, as: "Participants" }],
  });
  if (!eveniment) return null;
  return eveniment.Participants;
};

// Inscrie un participant dupa cod: valideaza intrari, verifica statusul si creaza inregistrarea
export const inscrieParticipantCuCod = async (cod, nume) => {
  if (!cod || !nume) {
    return { error: "Codul și numele sunt obligatorii." };
  }

  const codNormalizat = cod.toUpperCase();
  const eveniment = await Eveniment.findOne({
    where: { cod: codNormalizat },
  });

  if (!eveniment) {
    return { error: "Evenimentul nu există." };
  }

  const status = calculeazaStatus(eveniment);
  if (status !== "DESCHIS") {
    return { error: "Evenimentul nu este deschis.", status };
  }

  const participant = await Participant.create({
    nume,
    idEveniment: eveniment.id,
  });

  return { event: eveniment, status, participant };
};
