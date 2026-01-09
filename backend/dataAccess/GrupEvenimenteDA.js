import db from "../dbConfig.js";
import Eveniment from "../entities/Eveniment.js";
import GrupEvenimente from "../entities/GrupEvenimente.js";
import Participant from "../entities/Participant.js";
import { genereazaCod } from "../utils/utils.js";

// Valideaza si normalizeaza payload-ul unui eveniment primit din request
const valideazaEveniment = (payload = {}) => {
  const { nume, inceput, sfarsit, locatie, lat, lon } = payload;
  if (!nume || !inceput || !sfarsit) return null;

  const latNum = lat === undefined || lat === null || lat === "" ? null : Number(lat);
  const lonNum = lon === undefined || lon === null || lon === "" ? null : Number(lon);

  return {
    nume,
    inceput,
    sfarsit,
    locatie: locatie || null,
    lat: Number.isNaN(latNum) ? null : latNum,
    lon: Number.isNaN(lonNum) ? null : lonNum,
  };
};

// Lista toate grupurile cu evenimentele aferente
export const obtineGrupuri = async () => {
  return GrupEvenimente.findAll({
    include: [{ model: Eveniment, as: "Events" }],
    order: [["id", "ASC"]],
  });
};

// Gaseste un grup dupa id cu evenimentele sale
export const gasesteGrup = async (idGrup) => {
  return GrupEvenimente.findByPk(idGrup, {
    include: [{ model: Eveniment, as: "Events" }],
  });
};

// Creeaza un grup si evenimentele asociate intr-o singura tranzactie
export const creeazaGrupCuEvenimente = async (numeGrup, evenimentePrimite = []) => {
  const evenimenteValide = evenimentePrimite.map(valideazaEveniment).filter(Boolean);
  if (!numeGrup) throw new Error("Nume grup lipsă sau date invalide.");
  if (evenimenteValide.length === 0) throw new Error("Nu există evenimente valide.");

  return db.transaction(async (t) => {
    const grup = await GrupEvenimente.create(
      { nume: numeGrup },
      { transaction: t }
    );

    const evenimenteDeCreat = evenimenteValide.map(({ nume, inceput, sfarsit, locatie, lat, lon }) => ({
      nume,
      inceput,
      sfarsit,
      locatie,
      lat,
      lon,
      cod: genereazaCod(),
      idGrup: grup.id,
    }));

    const evenimenteCreate = await Eveniment.bulkCreate(evenimenteDeCreat, { transaction: t });

    return { group: grup, events: evenimenteCreate };
  });
};

// Adauga evenimente noi intr-un grup existent
export const adaugaEvenimenteLaGrup = async (idGrup, evenimentePrimite = []) => {
  const grup = await GrupEvenimente.findByPk(idGrup);
  if (!grup) return null;

  const evenimenteValide = evenimentePrimite.map(valideazaEveniment).filter(Boolean);
  if (evenimenteValide.length === 0) throw new Error("Nu există evenimente valide.");

  const create = evenimenteValide.map(({ nume, inceput, sfarsit, locatie, lat, lon }) => ({
    nume,
    inceput,
    sfarsit,
    locatie,
    lat,
    lon,
    cod: genereazaCod(),
    idGrup: idGrup,
  }));

  const createRezultat = await Eveniment.bulkCreate(create, { returning: true });

  return { group: grup, events: createRezultat };
};

// Sterge un grup dupa id; returneaza null daca nu exista
export const stergeGrupDupaId = async (idGrup) => {
  const grup = await GrupEvenimente.findByPk(idGrup);
  if (!grup) return null;

  await grup.destroy();
  return grup;
};

// Extinde un grup cu evenimente si participanti (folosit pentru detalii complete)
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
