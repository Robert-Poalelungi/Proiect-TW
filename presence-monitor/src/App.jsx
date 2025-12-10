import { useState } from "react";
import Home from "./components/Home";
import Organizer from "./components/Organizer";
import Join from "./components/Join";
import EventDetails from "./components/EventDetails";
import "./App.css";

function App() {
  const [page, setPage] = useState("home");
  const [selectedEventId, setSelectedEventId] = useState(null);

  const goHome = () => {
    setSelectedEventId(null);
    setPage("home");
  };

  const openOrganizer = () => {
    setSelectedEventId(null);
    setPage("organizer");
  };

  const openJoin = () => {
    setSelectedEventId(null);
    setPage("join");
  };

  const openEventDetails = (eventId) => {
    setSelectedEventId(eventId);
    setPage("details");
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-copy">
          <p className="badge">Monitorizare prezență</p>
          <h1>SPA React + Node</h1>
          <p className="subtitle">
            Creează evenimente, distribuie codul unic și urmărește live
            participanții. Backend-ul rulează local, fără baze de date.
          </p>
          <div className="hero-actions">
            <button className="btn primary" onClick={openOrganizer}>
              Modul organizator
            </button>
            <button className="btn ghost" onClick={openJoin}>
              Modul participant
            </button>
            <button className="btn text" onClick={goHome}>
              Acasă
            </button>
          </div>
        </div>
        <div className="hero-card">
          <p className="card-title">Flux rapid</p>
          <ul>
            <li>Grupuri + evenimente multiple</li>
            <li>Cod unic automat (6 caractere)</li>
            <li>OPEN/CLOSED calculat pe baza timpului</li>
            <li>Export CSV pentru eveniment sau grup</li>
          </ul>
        </div>
      </header>

      <main className="panel">
        {page === "home" && <Home onOrganizer={openOrganizer} onJoin={openJoin} />}
        {page === "organizer" && <Organizer onOpenEvent={openEventDetails} />}
        {page === "join" && <Join />}
        {page === "details" && selectedEventId && (
          <EventDetails eventId={selectedEventId} onBack={openOrganizer} />
        )}
      </main>
    </div>
  );
}

export default App;
