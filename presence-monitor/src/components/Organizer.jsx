import { useEffect, useState } from "react";
import {
  createGroup,
  deleteEvent,
  deleteGroup,
  exportGroupCsv,
  fetchGroups,
} from "../api";

const emptyEvent = { name: "", startTime: "", endTime: "" };

const Organizer = ({ onOpenEvent }) => {
  const [groupName, setGroupName] = useState("");
  const [rows, setRows] = useState([{ ...emptyEvent }]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await fetchGroups();
      setGroups(data);
    } catch (err) {
      setMessage(err.message || "Eroare la încărcarea grupurilor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const updateRow = (index, key, value) => {
    const copy = [...rows];
    copy[index] = { ...copy[index], [key]: value };
    setRows(copy);
  };

  const addRow = () => setRows((prev) => [...prev, { ...emptyEvent }]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const validEvents = rows.filter(
      (r) => r.name && r.startTime && r.endTime
    );

    if (!groupName || validEvents.length === 0) {
      setMessage("Completează numele grupului și cel puțin un eveniment.");
      return;
    }

    try {
      setLoading(true);
      await createGroup({ name: groupName, events: validEvents });
      setGroupName("");
      setRows([{ ...emptyEvent }]);
      setMessage("Grup creat cu succes.");
      loadGroups();
    } catch (err) {
      setMessage(err.message || "Nu s-a putut crea grupul.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportGroup = async (groupId) => {
    try {
      const res = await exportGroupCsv(groupId);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `group-${groupId}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setMessage(err.message || "Export nereușit.");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Ștergi acest eveniment?")) return;
    try {
      setLoading(true);
      await deleteEvent(eventId);
      setMessage("Eveniment șters.");
      await loadGroups();
    } catch (err) {
      setMessage(err.message || "Nu s-a putut șterge evenimentul.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm("Ștergi întreg grupul și toate evenimentele lui?")) return;
    try {
      setLoading(true);
      await deleteGroup(groupId);
      setMessage("Grup șters.");
      await loadGroups();
    } catch (err) {
      setMessage(err.message || "Nu s-a putut șterge grupul.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid two-col">
      <div className="surface">
        <h2>Creează grup + evenimente</h2>
        <form onSubmit={handleSubmit} className="grid">
          <div className="input-row">
            <label className="label" htmlFor="groupName">
              Nume grup
            </label>
            <input
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Ex: Săptămâna 12 - laborator"
            />
          </div>

          {rows.map((row, idx) => (
            <div key={idx} className="input-row">
              <div className="label">Eveniment #{idx + 1}</div>
              <input
                value={row.name}
                onChange={(e) => updateRow(idx, "name", e.target.value)}
                placeholder="Nume eveniment"
                required
              />
              <input
                type="datetime-local"
                value={row.startTime}
                onChange={(e) => updateRow(idx, "startTime", e.target.value)}
                required
              />
              <input
                type="datetime-local"
                value={row.endTime}
                onChange={(e) => updateRow(idx, "endTime", e.target.value)}
                required
              />
            </div>
          ))}

          <div className="actions">
            <button className="btn ghost" type="button" onClick={addRow}>
              Adaugă încă un eveniment
            </button>
            <button className="btn primary" type="submit" disabled={loading}>
              {loading ? "Se salvează..." : "Salvează grupul"}
            </button>
          </div>
          {message && <p className="small">{message}</p>}
        </form>
      </div>

      <div className="surface">
        <div className="actions" style={{ justifyContent: "space-between" }}>
          <h2 style={{ margin: 0 }}>Grupuri existente</h2>
          <button className="btn ghost" type="button" onClick={loadGroups}>
            Reîncarcă
          </button>
        </div>

        {loading && <p className="small">Se încarcă...</p>}
        {!loading && groups.length === 0 && <p>Nu există grupuri încă.</p>}

        <div className="list">
          {groups.map((group) => (
            <div key={group.id} className="list-item" style={{ flexDirection: "column", alignItems: "flex-start" }}>
              <div className="actions" style={{ width: "100%", justifyContent: "space-between" }}>
                <div>
                  <strong>{group.name}</strong>
                  <div className="small">{group.events.length} evenimente</div>
                </div>
                <div className="actions">
                  <button className="btn ghost" onClick={() => handleExportGroup(group.id)}>
                    Export CSV grup
                  </button>
                  <button className="btn text" onClick={() => handleDeleteGroup(group.id)}>
                    Șterge grup
                  </button>
                </div>
              </div>

              <div className="list" style={{ width: "100%" }}>
                {group.events.map((event) => (
                  <div key={event.id} className="list-item">
                    <div>
                      <div style={{ fontWeight: 600 }}>{event.name}</div>
                      <div className="small">Cod: {event.code}</div>
                      <div className="small">
                        {new Date(event.startTime).toLocaleString()} — {new Date(event.endTime).toLocaleString()}
                      </div>
                    </div>
                    <div className="actions">
                      <span
                        className={`status-pill ${
                          event.status === "OPEN" ? "status-open" : "status-closed"
                        }`}
                      >
                        {event.status}
                      </span>
                      <button className="btn primary" onClick={() => onOpenEvent(event.id)}>
                        Detalii
                      </button>
                      <button className="btn ghost" onClick={() => handleDeleteEvent(event.id)}>
                        Șterge
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Organizer;
