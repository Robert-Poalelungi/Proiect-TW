import { useEffect, useState } from "react";
import { exportEventCsv, getEvent, getParticipants } from "../api";
import { makeQrData } from "../qr";

const EventDetails = ({ eventId, onBack }) => {
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [qrData, setQrData] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setMessage("");
      const [ev, part] = await Promise.all([getEvent(eventId), getParticipants(eventId)]);
      setEvent(ev);
      setParticipants(part);
      const dataUrl = await makeQrData(ev.code);
      setQrData(dataUrl);
    } catch (err) {
      setMessage(err.message || "Nu s-au putut încărca detaliile evenimentului.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [eventId]);

  const handleExport = async () => {
    try {
      const res = await exportEventCsv(eventId);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `event-${eventId}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setMessage(err.message || "Export nereușit.");
    }
  };

  if (!event) {
    return (
      <div className="surface">
        <p>Se încarcă detaliile evenimentului...</p>
      </div>
    );
  }

  const statusClass = event.status === "OPEN" ? "status-open" : "status-closed";

  return (
    <div className="surface">
      <div className="actions" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ margin: "0 0 4px" }}>{event.name}</h2>
          <div className="small">Cod: {event.code}</div>
          <div className="small">
            {new Date(event.startTime).toLocaleString()} — {new Date(event.endTime).toLocaleString()}
          </div>
        </div>
        <div className="actions">
          <span className={`status-pill ${statusClass}`}>{event.status}</span>
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
            <img src={qrData} alt={`QR pentru ${event.code}`} width={140} height={140} />
            <button
              className="btn ghost"
              onClick={() => {
                const link = document.createElement("a");
                link.href = qrData;
                link.download = `event-${event.id}-qr.png`;
                link.click();
              }}
            >
              Descarcă PNG
            </button>
          </div>
        </div>
      )}

      {message && <p className="small" style={{ color: "#b91c1c" }}>{message}</p>}

      <h3>Participanți ({participants.length})</h3>
      <div className="list">
        {participants.length === 0 && <p>Niciun participant încă.</p>}
        {participants.map((p, idx) => (
          <div key={idx} className="list-item" style={{ justifyContent: "space-between" }}>
            <div>
              <strong>{p.name}</strong>
              <div className="small">{new Date(p.joinedAt).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventDetails;
