import Eveniment from "../entities/Eveniment.js";
import Participant from "../entities/Participant.js";
import { calculeazaStatus } from "../utils/utils.js";

export const gasesteEvenimentDupaId = async (evenimentId) => {
  return Eveniment.findByPk(evenimentId, {
    include: [{ model: Participant, as: "Participants" }],
  });
};

export const stergeEvenimentDupaId = async (evenimentId) => {
  const eveniment = await Eveniment.findByPk(evenimentId);
  if (!eveniment) return null;
  await eveniment.destroy();
  return eveniment;
};

export const obtineParticipantiPentruEveniment = async (evenimentId) => {
  const eveniment = await Eveniment.findByPk(evenimentId, {
    include: [{ model: Participant, as: "Participants" }],
  });
  if (!eveniment) return null;
  return eveniment.Participants;
};

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
