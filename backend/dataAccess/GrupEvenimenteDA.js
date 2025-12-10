import db from "../dbConfig.js";
import Eveniment from "../entities/Eveniment.js";
import GrupEvenimente from "../entities/GrupEvenimente.js";
import Participant from "../entities/Participant.js";
import { genereazaCod } from "../utils/utils.js";

const valideazaEveniment = (payload = {}) => {
  const { nume, inceput, sfarsit } = payload;
  if (!nume || !inceput || !sfarsit) return null;
  return { nume, inceput, sfarsit };
};

export const obtineGrupuri = async () => {
  return GrupEvenimente.findAll({
    include: [{ model: Eveniment, as: "Events" }],
    order: [["id", "ASC"]],
  });
};

export const gasesteGrup = async (idGrup) => {
  return GrupEvenimente.findByPk(idGrup, {
    include: [{ model: Eveniment, as: "Events" }],
  });
};

export const creeazaGrupCuEvenimente = async (numeGrup, evenimentePrimite = []) => {
  const evenimenteValide = evenimentePrimite.map(valideazaEveniment).filter(Boolean);
  if (!numeGrup) throw new Error("Nume grup lipsă sau date invalide.");
  if (evenimenteValide.length === 0) throw new Error("Nu există evenimente valide.");

  return db.transaction(async (t) => {
    const grup = await GrupEvenimente.create(
      { nume: numeGrup },
      { transaction: t }
    );

    const evenimenteDeCreat = evenimenteValide.map(({ nume, inceput, sfarsit }) => ({
      nume,
      inceput,
      sfarsit,
      cod: genereazaCod(),
      idGrup: grup.id,
    }));

    const evenimenteCreate = await Eveniment.bulkCreate(evenimenteDeCreat, { transaction: t });

    return { group: grup, events: evenimenteCreate };
  });
};

export const adaugaEvenimenteLaGrup = async (idGrup, evenimentePrimite = []) => {
  const grup = await GrupEvenimente.findByPk(idGrup);
  if (!grup) return null;

  const evenimenteValide = evenimentePrimite.map(valideazaEveniment).filter(Boolean);
  if (evenimenteValide.length === 0) throw new Error("Nu există evenimente valide.");

  const create = evenimenteValide.map(({ nume, inceput, sfarsit }) => ({
    nume,
    inceput,
    sfarsit,
    cod: genereazaCod(),
    idGrup: idGrup,
  }));

  const createRezultat = await Eveniment.bulkCreate(create, { returning: true });

  return { group: grup, events: createRezultat };
};

export const stergeGrupDupaId = async (idGrup) => {
  const grup = await GrupEvenimente.findByPk(idGrup);
  if (!grup) return null;

  await grup.destroy();
  return grup;
};

export const extindeGrup = async (grup) => {
  if (!grup) return null;
  const complet = await GrupEvenimente.findByPk(grup.id, {
    include: [
      {
        model: Eveniment,
        as: "Events",
        include: [{ model: Participant, as: "Participants" }],
      },
    ],
  });
  return complet;
};
