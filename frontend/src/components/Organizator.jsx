import { useEffect, useState } from "react";
import {
  adaugaEvenimenteLaGrup,
  cautaLocatie,
  creeazaGrup,
  stergeEveniment,
  stergeGrup,
  exportaGrupCsv,
  obtineGrupuri,
} from "../api";

const evenimentGol = { nume: "", inceput: "", sfarsit: "", locatie: "", lat: "", lon: "" };
const etichetaStatus = (status) => status;

// Normalizes a `datetime-local` value to an ISO string (UTC) so times stay consistent regardless of server timezone
const normalizareData = (valoare) => {
  if (!valoare) return valoare;
  const d = new Date(valoare);
  if (Number.isNaN(d.getTime())) return valoare;
  return d.toISOString();
};

// Dashboard-ul organizatorului: gestionare grupuri si evenimente
const Organizator = ({ peDeschideEveniment }) => {
  const [numeGrup, setNumeGrup] = useState("");
  const [randuriEvenimente, setRanduriEvenimente] = useState([Object.assign({}, evenimentGol)]);
  const [grupuri, setGrupuri] = useState([]);
  const [seIncarca, setSeIncarca] = useState(false);
  const [mesaj, setMesaj] = useState("");
  const [formulareAdaugare, setFormulareAdaugare] = useState({});
  const [extinse, setExtinse] = useState({});
  const [geocodeLoadingCreate, setGeocodeLoadingCreate] = useState(false);
  const [geocodeLoadingAdd, setGeocodeLoadingAdd] = useState({});
  const [mesajeGrup, setMesajeGrup] = useState({});

  // Incarca grupurile si evenimentele existente
  const incarcaGrupuri = async () => {
    try {
      setSeIncarca(true);
      const data = await obtineGrupuri();
      setGrupuri(data);
    } catch (err) {
      setMesaj(err.message || "Eroare la încărcarea grupurilor");
    } finally {
      setSeIncarca(false);
    }
  };

  useEffect(() => {
    incarcaGrupuri();
  }, []);

  // Actualizeaza un camp dintr-un rand de eveniment din formular
  const actualizeazaRand = (index, key, value) => {
    const copie = randuriEvenimente.slice();
    copie[index] = Object.assign({}, copie[index], { [key]: value });
    setRanduriEvenimente(copie);
  };

  const adaugaRand = () => setRanduriEvenimente((prev) => prev.concat([Object.assign({}, evenimentGol)]));

  const stergeRand = (index) => {
    setRanduriEvenimente((prev) => {
      if (prev.length <= 1) return [Object.assign({}, evenimentGol)];
      return prev.filter((_, i) => i !== index);
    });
  };

  // Geocodare pentru un rand din formularul de creare
  const cautaCoordonate = async (index) => {
    const valoare = randuriEvenimente[index]?.locatie;
    if (!valoare) {
      setMesaj("Completează o adresă pentru a căuta coordonatele.");
      return;
    }
    try {
      setGeocodeLoadingCreate(true);
      setMesaj("");
      const rezultat = await cautaLocatie(valoare);
      setRanduriEvenimente((prev) => {
        const copie = prev.slice();
        const curent = copie[index] ? Object.assign({}, copie[index]) : Object.assign({}, evenimentGol);
        curent.lat = rezultat.lat?.toString() || "";
        curent.lon = rezultat.lon?.toString() || "";
        copie[index] = curent;
        return copie;
      });
      setMesaj(`Adresă găsită: ${rezultat.adresa}`);
    } catch (err) {
      setMesaj(err.message || "Nu am putut găsi locația.");
    } finally {
      setGeocodeLoadingCreate(false);
    }
  };

  const gestioneazaSubmit = async (e) => {
    e.preventDefault();
    setMesaj("");

    const evenimenteValide = randuriEvenimente.filter((r) => r.nume && r.inceput && r.sfarsit);

    if (!numeGrup || evenimenteValide.length === 0) {
      setMesaj("Completează numele grupului și cel puțin un eveniment.");
      return;
    }

    try {
      setSeIncarca(true);
      await creeazaGrup({
        nume: numeGrup,
        evenimente: evenimenteValide.map((ev) =>
          Object.assign({}, ev, {
            inceput: normalizareData(ev.inceput),
            sfarsit: normalizareData(ev.sfarsit),
          })
        ),
      });
      setNumeGrup("");
      setRanduriEvenimente([Object.assign({}, evenimentGol)]);
      setMesaj("Grup creat cu succes.");
      incarcaGrupuri();
    } catch (err) {
      setMesaj(err.message || "Nu s-a putut crea grupul.");
    } finally {
      setSeIncarca(false);
    }
  };

  // Export CSV pentru un grup
  const exportaGrup = async (groupId) => {
    try {
      const res = await exportaGrupCsv(groupId);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `grup-${groupId}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setMesaj(err.message || "Export nereușit.");
    }
  };

  // Sterge un eveniment individual
  const stergeEvenimentHandler = async (eventId) => {
    if (!window.confirm("Ștergi acest eveniment?")) return;
    try {
      setSeIncarca(true);
      await stergeEveniment(eventId);
      setMesaj("Eveniment șters.");
      await incarcaGrupuri();
    } catch (err) {
      setMesaj(err.message || "Nu s-a putut șterge evenimentul.");
    } finally {
      setSeIncarca(false);
    }
  };

  // Sterge un grup si toate evenimentele lui
  const stergeGrupHandler = async (groupId) => {
    if (!window.confirm("Ștergi întreg grupul și toate evenimentele lui?")) return;
    try {
      setSeIncarca(true);
      await stergeGrup(groupId);
      setMesaj("Grup șters.");
      await incarcaGrupuri();
    } catch (err) {
      setMesaj(err.message || "Nu s-a putut șterge grupul.");
    } finally {
      setSeIncarca(false);
    }
  };

  // Sincronizeaza formularul de adaugare eveniment intr-un grup existent
  const actualizeazaFormularAdaugare = (groupId, key, value) => {
    setFormulareAdaugare((prev) => {
      const urmator = Object.assign({}, prev);
      const curent = prev[groupId] ? Object.assign({}, prev[groupId]) : {};
      curent[key] = value;
      urmator[groupId] = curent;
      return urmator;
    });
  };

  // Adauga un eveniment nou intr-un grup existent
  const adaugaEveniment = async (groupId) => {
    const form = formulareAdaugare[groupId] || {};
    if (!form.nume || !form.inceput || !form.sfarsit) {
      setMesajeGrup((prev) => Object.assign({}, prev, { [groupId]: "Completează nume, start și end pentru eveniment." }));
      return;
    }
    try {
      setSeIncarca(true);
      await adaugaEvenimenteLaGrup(groupId, [
        {
          nume: form.nume,
          inceput: normalizareData(form.inceput),
          sfarsit: normalizareData(form.sfarsit),
          locatie: form.locatie,
          lat: form.lat,
          lon: form.lon,
        },
      ]);
      setMesajeGrup((prev) => Object.assign({}, prev, { [groupId]: "Eveniment adăugat în grup." }));
      setFormulareAdaugare((prev) => {
        const urmator = Object.assign({}, prev);
        urmator[groupId] = { nume: "", inceput: "", sfarsit: "", locatie: "", lat: "", lon: "" };
        return urmator;
      });
      setExtinse((prev) => {
        const urmator = Object.assign({}, prev);
        urmator[groupId] = false;
        return urmator;
      });
      await incarcaGrupuri();
    } catch (err) {
      setMesajeGrup((prev) => Object.assign({}, prev, { [groupId]: err.message || "Nu s-a putut adăuga evenimentul." }));
    } finally {
      setSeIncarca(false);
    }
  };

  return (
    <div className="dual-card">
      {/* Panou stânga: creare grup + evenimente noi */}
      <div className="dual-pane">
        <h2>Creează grup și evenimente</h2>
        <form onSubmit={gestioneazaSubmit} className="grid">
          <div className="input-row">
            <label className="label" htmlFor="groupName">
              Nume grup
            </label>
            <input
              id="groupName"
              value={numeGrup}
              onChange={(e) => setNumeGrup(e.target.value)}
              placeholder="Ex: Săptămâna 1"
            />
          </div>

          {randuriEvenimente.map((row, idx) => (
            <div key={idx} className="input-row">
              <div className="label">Eveniment #{idx + 1}</div>
              <input
                value={row.nume}
                onChange={(e) => actualizeazaRand(idx, "nume", e.target.value)}
                placeholder="Nume eveniment"
                required
              />
              <input
                type="datetime-local"
                value={row.inceput}
                onChange={(e) => actualizeazaRand(idx, "inceput", e.target.value)}
                required
              />
              <input
                type="datetime-local"
                value={row.sfarsit}
                onChange={(e) => actualizeazaRand(idx, "sfarsit", e.target.value)}
                required
              />
              <input
                value={row.locatie}
                onChange={(e) => actualizeazaRand(idx, "locatie", e.target.value)}
                placeholder="Locație"
              />
              <div className="actions" style={{ gap: 8 }}>
                <input
                  value={row.lat}
                  onChange={(e) => actualizeazaRand(idx, "lat", e.target.value)}
                  placeholder="Latitudine"
                />
                <input
                  value={row.lon}
                  onChange={(e) => actualizeazaRand(idx, "lon", e.target.value)}
                  placeholder="Longitudine"
                />
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => cautaCoordonate(idx)}
                  disabled={geocodeLoadingCreate}
                >
                  {geocodeLoadingCreate ? "Caută..." : "Găsește coordonate"}
                </button>
                {randuriEvenimente.length > 1 && (
                  <button className="btn ghost danger" type="button" onClick={() => stergeRand(idx)}>
                    Șterge eveniment
                  </button>
                )}
              </div>
            </div>
          ))}

          <div className="actions">
            <button className="btn ghost" type="button" onClick={adaugaRand}>
              Adaugă încă un eveniment
            </button>
            <button className="btn primary" type="submit" disabled={seIncarca}>
              {seIncarca ? "Se salvează..." : "Salvează grupul"}
            </button>
          </div>
          {mesaj && <p className="small">{mesaj}</p>}
        </form>
      </div>

      {/* Panou dreapta: listare grupuri existente și acțiuni */}
      <div className="dual-pane">
        <div className="actions" style={{ justifyContent: "space-between" }}>
          <h2 style={{ margin: 0 }}>Grupuri existente</h2>
        </div>

        {seIncarca && <p className="small">Se încarcă...</p>}
        {!seIncarca && grupuri.length === 0 && <p>Nu există grupuri încă.</p>}

        <div className="list">
          {grupuri.map((group) => (
            <div key={group.id} className="list-item group-card" style={{ flexDirection: "column", alignItems: "flex-start" }}>
              <div className="actions" style={{ width: "100%", justifyContent: "space-between" }}>
                <div>
                  <strong>{group.nume}</strong>
                  <div className="small">{group.evenimente.length} evenimente</div>
                </div>
                <div className="actions">
                  <button className="btn ghost" onClick={() => exportaGrup(group.id)}>
                    Export CSV grup
                  </button>
                  <button className="btn ghost danger" onClick={() => stergeGrupHandler(group.id)}>
                    Șterge grup
                  </button>
                </div>
              </div>

              <div className="list" style={{ width: "100%" }}>
                {group.evenimente.map((eveniment) => (
                  <div key={eveniment.id} className="list-item event-row">
                    <div>
                      <div style={{ fontWeight: 600 }}>{eveniment.nume}</div>
                      <div className="small">Cod: {eveniment.cod}</div>
                      <div className="small">
                        {new Date(eveniment.inceput).toLocaleString()} — {new Date(eveniment.sfarsit).toLocaleString()}
                      </div>
                      {eveniment.locatie && <div className="small">Locație: {eveniment.locatie}</div>}
                      {eveniment.lat !== null && eveniment.lon !== null && eveniment.lat !== undefined && eveniment.lon !== undefined && (
                        <div className="small">Coordonate: {eveniment.lat}, {eveniment.lon}</div>
                      )}
                    </div>
                    <div className="actions">
                      <span
                        className={`status-pill ${
                          eveniment.status === "DESCHIS" ? "status-open" : "status-closed"
                        }`}
                      >
                        {etichetaStatus(eveniment.status)}
                      </span>
                      <button className="btn primary" onClick={() => peDeschideEveniment(eveniment.id)}>
                        Detalii
                      </button>
                      <button className="btn ghost danger" onClick={() => stergeEvenimentHandler(eveniment.id)}>
                        Șterge
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Formular de adăugare rapidă pentru un grup extins */}
              <div className="list-item no-separator" style={{ flexDirection: "column", alignItems: "flex-start" }}>
                <div className="actions" style={{ width: "100%", justifyContent: "space-between" }}>
                  <div className="label">Eveniment nou în acest grup</div>
                  <button
                    className="btn ghost"
                    type="button"
                    onClick={() =>
                      setExtinse((prev) => {
                        const urmator = Object.assign({}, prev);
                        urmator[group.id] = !prev[group.id];
                        return urmator;
                      })
                    }
                  >
                    {extinse[group.id] ? "Ascunde" : "Adaugă"}
                  </button>
                </div>
                {extinse[group.id] && (
                  <>
                    <input
                      value={formulareAdaugare[group.id]?.nume || ""}
                      onChange={(e) => actualizeazaFormularAdaugare(group.id, "nume", e.target.value)}
                      placeholder="Nume eveniment"
                    />
                    <input
                      type="datetime-local"
                      value={formulareAdaugare[group.id]?.inceput || ""}
                      onChange={(e) => actualizeazaFormularAdaugare(group.id, "inceput", e.target.value)}
                    />
                    <input
                      type="datetime-local"
                      value={formulareAdaugare[group.id]?.sfarsit || ""}
                      onChange={(e) => actualizeazaFormularAdaugare(group.id, "sfarsit", e.target.value)}
                    />
                    <input
                      value={formulareAdaugare[group.id]?.locatie || ""}
                      onChange={(e) => actualizeazaFormularAdaugare(group.id, "locatie", e.target.value)}
                      placeholder="Locație"
                    />
                    <div className="actions" style={{ gap: 8 }}>
                      <input
                        value={formulareAdaugare[group.id]?.lat || ""}
                        onChange={(e) => actualizeazaFormularAdaugare(group.id, "lat", e.target.value)}
                        placeholder="Latitudine"
                      />
                      <input
                        value={formulareAdaugare[group.id]?.lon || ""}
                        onChange={(e) => actualizeazaFormularAdaugare(group.id, "lon", e.target.value)}
                        placeholder="Longitudine"
                      />
                      <button
                        className="btn ghost"
                        type="button"
                        onClick={async () => {
                          const adresa = (formulareAdaugare[group.id]?.locatie || "").trim();
                          if (!adresa) {
                            setMesajeGrup((prev) => Object.assign({}, prev, { [group.id]: "Completează o adresă pentru a căuta coordonatele." }));
                            return;
                          }
                          try {
                            setGeocodeLoadingAdd((prev) => Object.assign({}, prev, { [group.id]: true }));
                            const rezultat = await cautaLocatie(adresa);
                            setFormulareAdaugare((prev) => {
                              const urmator = Object.assign({}, prev);
                              urmator[group.id] = Object.assign({}, urmator[group.id] || {}, {
                                lat: rezultat.lat?.toString() || "",
                                lon: rezultat.lon?.toString() || "",
                              });
                              return urmator;
                            });
                            setMesajeGrup((prev) => Object.assign({}, prev, { [group.id]: `Adresă găsită: ${rezultat.adresa}` }));
                          } catch (err) {
                            setMesajeGrup((prev) => Object.assign({}, prev, { [group.id]: err.message || "Nu am putut găsi locația." }));
                          } finally {
                            setGeocodeLoadingAdd((prev) => Object.assign({}, prev, { [group.id]: false }));
                          }
                        }}
                        disabled={!!geocodeLoadingAdd[group.id]}
                      >
                        {geocodeLoadingAdd[group.id] ? "Caută..." : "Găsește coordonate"}
                      </button>
                    </div>
                    {mesajeGrup[group.id] && <p className="small">{mesajeGrup[group.id]}</p>}
                    <div className="actions" style={{ gap: 8 }}>
                      <button className="btn primary" type="button" onClick={() => adaugaEveniment(group.id)} disabled={seIncarca}>
                        {seIncarca ? "Se adaugă..." : "Adaugă în grup"}
                      </button>
                      <button
                        className="btn text"
                        type="button"
                        onClick={() =>
                          setFormulareAdaugare((prev) => {
                            const urmator = Object.assign({}, prev);
                            urmator[group.id] = { nume: "", inceput: "", sfarsit: "", locatie: "", lat: "", lon: "" };
                            return urmator;
                          })
                        }
                      >
                        Resetează
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Organizator;
