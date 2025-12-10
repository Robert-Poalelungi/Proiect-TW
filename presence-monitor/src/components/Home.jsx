const Home = ({ onOrganizer, onJoin }) => {
  return (
    <div className="grid two-col">
      <div className="surface">
        <h2>Rol organizator</h2>
        <p>Creează grupuri, evenimente și distribui codul unic generat.</p>
        <ul>
          <li>Mai multe evenimente într-un grup</li>
          <li>Status automat OPEN / CLOSED</li>
          <li>Export CSV pentru raport rapid</li>
        </ul>
        <button className="btn primary" onClick={onOrganizer}>
          Intră în modul organizator
        </button>
      </div>

      <div className="surface">
        <h2>Rol participant</h2>
        <p>Introdu codul primit și confirmă prezența în câteva secunde.</p>
        <ul>
          <li>Validare cod și status eveniment</li>
          <li>Înregistrare oră exactă</li>
          <li>Îl vezi imediat în lista de participanți</li>
        </ul>
        <button className="btn ghost" onClick={onJoin}>
          Intră în modul participant
        </button>
      </div>
    </div>
  );
};

export default Home;
