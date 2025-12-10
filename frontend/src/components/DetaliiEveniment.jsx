import { useEffect, useState } from "react";
import { exportaEvenimentCsv, obtineEveniment, obtineParticipanti } from "../api";
import { makeQrData } from "../qr";

const DetaliiEveniment = ({ eventId, onBack }) => {
  const [eveniment, setEveniment] = useState(null);
  const [participanti, setParticipanti] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mesaj, setMesaj] = useState("");
  const [qrData, setQrData] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setMesaj("");
      const [ev, part] = await Promise.all([obtineEveniment(eventId), obtineParticipanti(eventId)]);
      setEveniment(ev);
      setParticipanti(part);
      const dataUrl = await makeQrData(ev.cod);
      setQrData(dataUrl);
    } catch (err) {
      setMesaj(err.message || "Nu s-au putut încărca detaliile evenimentului.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [eventId]);

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
      <div className="surface">
        <p>Se încarcă detaliile evenimentului...</p>
      </div>
    );
  }

  const statusClass = eveniment.status === "OPEN" ? "status-open" : "status-closed";

  return (
    <div className="surface">
      <div className="actions" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ margin: "0 0 4px" }}>{eveniment.nume}</h2>
          <div className="small">Cod: {eveniment.cod}</div>
          <div className="small">
            {new Date(eveniment.inceput).toLocaleString()} — {new Date(eveniment.sfarsit).toLocaleString()}
          </div>
        </div>
        <div className="actions">
          <span className={`status-pill ${statusClass}`}>{eveniment.status}</span>
          <button className="btn ghost" onClick={load} disabled={loading}>
            Reîncarcă
          </button>
          <button className="btn primary" onClick={handleExport}>
            Export CSV
          </button>
          <button className="btn text" onClick={onBack}>
            Înapoi
          </button>
        </div>
      </div>

      {qrData && (
        <div className="list-item" style={{ margin: "14px 0" }}>
          <div>
            <strong>QR cod acces</strong>
            <div className="small">Scanează sau descarcă pentru distribuire rapidă.</div>
          </div>
          <div className="actions" style={{ alignItems: "center" }}>
            <img src={qrData} alt={`QR pentru ${eveniment.cod}`} width={140} height={140} />
            <button
              className="btn ghost"
              onClick={() => {
                const link = document.createElement("a");
                link.href = qrData;
                link.download = `eveniment-${eveniment.id}-qr.png`;
                link.click();
              }}
            >
              Descarcă PNG
            </button>
          </div>
        </div>
      )}

      {mesaj && <p className="small" style={{ color: "#b91c1c" }}>{mesaj}</p>}

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
