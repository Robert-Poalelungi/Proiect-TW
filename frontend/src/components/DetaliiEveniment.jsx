import { useEffect, useState } from "react";
import { exportaEvenimentCsv, obtineEveniment, obtineParticipanti } from "../api";

// Mapare simpla a statusului (poate fi extinsa ulterior pentru traduceri)
const etichetaStatus = (status) => status;

// Afișează detalii despre un eveniment și lista participanților
const DetaliiEveniment = ({ eventId, onBack }) => {
  const [eveniment, setEveniment] = useState(null);
  const [participanti, setParticipanti] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mesaj, setMesaj] = useState("");

  // Încarcă evenimentul și participanții în paralel
  const load = async () => {
    try {
      setLoading(true);
      setMesaj("");
      const [ev, part] = await Promise.all([obtineEveniment(eventId), obtineParticipanti(eventId)]);
      setEveniment(ev);
      setParticipanti(part);
    } catch (err) {
      setMesaj(err.message || "Nu s-au putut încărca detaliile evenimentului.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [eventId]);

  // Descarcă CSV pentru evenimentul curent
  const handleExport = async () => {
    try {
      const res = await exportaEvenimentCsv(eventId);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `eveniment-${eventId}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setMesaj(err.message || "Export nereușit.");
    }
  };

  if (!eveniment) {
    return (
      <div className="detail-card">
        <p>Se încarcă detaliile evenimentului...</p>
      </div>
    );
  }

  const statusClass = eveniment.status === "DESCHIS" ? "status-open" : "status-closed";

  return (
    <div className="detail-card">
      <div className="actions" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ margin: "0 0 4px" }}>{eveniment.nume}</h2>
          <div className="small">Cod: {eveniment.cod}</div>
          <div className="small">
            {new Date(eveniment.inceput).toLocaleString()} — {new Date(eveniment.sfarsit).toLocaleString()}
          </div>
          {eveniment.locatie && <div className="small">Locație: {eveniment.locatie}</div>}
          {eveniment.lat !== null && eveniment.lon !== null && eveniment.lat !== undefined && eveniment.lon !== undefined && (
            <div className="small">
              <a
                href={`https://www.openstreetmap.org/?mlat=${eveniment.lat}&mlon=${eveniment.lon}#map=15/${eveniment.lat}/${eveniment.lon}`}
                target="_blank"
                rel="noreferrer"
              >
                Vezi pe hartă
              </a>
            </div>
          )}
        </div>
        <div className="actions">
          <span className={`status-pill ${statusClass}`}>{etichetaStatus(eveniment.status)}</span>
          <button className="btn primary" onClick={handleExport}>
            Export CSV
          </button>
          <button className="btn ghost back" onClick={onBack}>
            Înapoi
          </button>
        </div>
      </div>

      <div className="code-box">
        <div className="small">Cod acces</div>
        <div className="code-value">{eveniment.cod}</div>
      </div>

      {mesaj && <p className="small" style={{ color: "#c1121f" }}>{mesaj}</p>}

      <h3>Participanți ({participanti.length})</h3>
      <div className="list">
        {participanti.length === 0 && <p>Niciun participant încă.</p>}
        {participanti.map((p, idx) => (
          <div key={idx} className="list-item" style={{ justifyContent: "space-between" }}>
            <div>
              <strong>{p.nume}</strong>
              <div className="small">{new Date(p.inscrisLa).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DetaliiEveniment;
