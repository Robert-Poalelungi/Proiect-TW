export const genereazaCod = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export const calculeazaStatus = (eveniment) => {
  const now = new Date();
  const start = new Date(eveniment.inceput);
  const end = new Date(eveniment.sfarsit);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "INCHIS";
  if (now < start) return "INCHIS";
  if (now > end) return "INCHIS";
  return "DESCHIS";
};

export const adaugaStatus = (eveniment) => {
  const copie = Object.assign({}, eveniment);
  copie.status = calculeazaStatus(eveniment);
  return copie;
};
