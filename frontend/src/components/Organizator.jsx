import { useEffect, useState } from "react";
import {
  adaugaEvenimenteLaGrup,
  creeazaGrup,
  stergeEveniment,
  stergeGrup,
  exportaGrupCsv,
  obtineGrupuri,
} from "../api";

const evenimentGol = { nume: "", inceput: "", sfarsit: "" };
const etichetaStatus = (status) => status;

const Organizator = ({ peDeschideEveniment }) => {
  const [numeGrup, setNumeGrup] = useState("");
  const [randuriEvenimente, setRanduriEvenimente] = useState([Object.assign({}, evenimentGol)]);
  const [grupuri, setGrupuri] = useState([]);
  const [seIncarca, setSeIncarca] = useState(false);
  const [mesaj, setMesaj] = useState("");
  const [formulareAdaugare, setFormulareAdaugare] = useState({});
  const [extinse, setExtinse] = useState({});

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

  const actualizeazaRand = (index, key, value) => {
    const copie = randuriEvenimente.slice();
    copie[index] = Object.assign({}, copie[index], { [key]: value });
    setRanduriEvenimente(copie);
  };

  const adaugaRand = () => setRanduriEvenimente((prev) => prev.concat([Object.assign({}, evenimentGol)]));

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
      await creeazaGrup({ nume: numeGrup, evenimente: evenimenteValide });
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

  const actualizeazaFormularAdaugare = (groupId, key, value) => {
    setFormulareAdaugare((prev) => {
      const urmator = Object.assign({}, prev);
      const curent = prev[groupId] ? Object.assign({}, prev[groupId]) : {};
      curent[key] = value;
      urmator[groupId] = curent;
      return urmator;
    });
  };

  const adaugaEveniment = async (groupId) => {
    const form = formulareAdaugare[groupId] || {};
    if (!form.nume || !form.inceput || !form.sfarsit) {
      setMesaj("Completează nume, start și end pentru eveniment.");
      return;
    }
    try {
      setSeIncarca(true);
      await adaugaEvenimenteLaGrup(groupId, [
        {
          nume: form.nume,
          inceput: form.inceput,
          sfarsit: form.sfarsit,
        },
      ]);
      setMesaj("Eveniment adăugat în grup.");
      setFormulareAdaugare((prev) => {
        const urmator = Object.assign({}, prev);
        urmator[groupId] = { nume: "", inceput: "", sfarsit: "" };
        return urmator;
      });
      setExtinse((prev) => {
        const urmator = Object.assign({}, prev);
        urmator[groupId] = false;
        return urmator;
      });
      await incarcaGrupuri();
    } catch (err) {
      setMesaj(err.message || "Nu s-a putut adăuga evenimentul.");
    } finally {
      setSeIncarca(false);
    }
  };

  return (
    <div className="grid two-col">
      <div className="surface">
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

      <div className="surface">
        <div className="actions" style={{ justifyContent: "space-between" }}>
          <h2 style={{ margin: 0 }}>Grupuri existente</h2>
          <button className="btn ghost" type="button" onClick={incarcaGrupuri}>
            Reîncarcă
          </button>
        </div>

        {seIncarca && <p className="small">Se încarcă...</p>}
        {!seIncarca && grupuri.length === 0 && <p>Nu există grupuri încă.</p>}

        <div className="list">
          {grupuri.map((group) => (
            <div key={group.id} className="list-item" style={{ flexDirection: "column", alignItems: "flex-start" }}>
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
                  <div key={eveniment.id} className="list-item">
                    <div>
                      <div style={{ fontWeight: 600 }}>{eveniment.nume}</div>
                      <div className="small">Cod: {eveniment.cod}</div>
                      <div className="small">
                        {new Date(eveniment.inceput).toLocaleString()} — {new Date(eveniment.sfarsit).toLocaleString()}
                      </div>
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

              <div className="list-item" style={{ flexDirection: "column", alignItems: "flex-start" }}>
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
                            urmator[group.id] = { nume: "", inceput: "", sfarsit: "" };
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
