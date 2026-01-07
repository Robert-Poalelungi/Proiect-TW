import { useEffect, useState } from "react";
import { exportaEvenimentCsv, obtineEveniment, obtineParticipanti } from "../api";
import { makeQrData } from "../qr";

const etichetaStatus = (status) => status;

const DetaliiEveniment = ({ eventId, onBack }) => {
  const [eveniment, setEveniment] = useState(null);
  const [participanti, setParticipanti] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mesaj, setMesaj] = useState("");
  const [qr, setQr] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setMesaj("");
      setQr("");
      const [ev, part] = await Promise.all([obtineEveniment(eventId), obtineParticipanti(eventId)]);
      setEveniment(ev);
      setParticipanti(part);
      const data = await makeQrData(ev.cod, 180);
      setQr(data);
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
      setMesaj(err.message || "Export ratat");
    }
  };

  if (!eveniment) {
    return (
      <div className="surface">
        <p>Se încarcă detaliile evenimentului...</p>
      </div>
    );
  }

  const statusClass = eveniment.status === "DESCHIS" ? "status-open" : "status-closed";

  return (
    <div className="surface">
      <div className="actions" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ margin: "0 0 4px" }}>{eveniment.nume}</h2>
          <div className="small">Cod: {eveniment.cod}</div>
          <div className="small">{new Date(eveniment.inceput).toLocaleString()} — {new Date(eveniment.sfarsit).toLocaleString()}</div>
        </div>
        <div className="actions">
          <span className={`status-pill ${statusClass}`}>{etichetaStatus(eveniment.status)}</span>
          <button className="btn ghost" onClick={load} disabled={loading}>Reload</button>
          <button className="btn primary" onClick={handleExport}>CSV</button>
          <button className="btn text" onClick={onBack}>Inapoi</button>
        </div>
      </div>

      {qr && (
        <div style={{ marginTop: 8 }}>
          <div className="small">QR pentru cod</div>
          <img src={qr} alt="QR" style={{ width: 150, height: 150, border: "1px solid #e5e7eb" }} />
        </div>
      )}

      {mesaj && <p className="small" style={{ color: "#b91c1c" }}>{mesaj}</p>}

      <h3>Participanti ({participanti.length})</h3>
      <div className="list">
        {participanti.length === 0 && <p>Nu sunt participanti inca.</p>}
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
