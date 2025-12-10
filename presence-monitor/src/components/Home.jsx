const Home = ({ onOrganizer, onJoin }) => {
  return (
    <div className="surface" style={{ textAlign: "center" }}>
      <h2>Alege modul</h2>
      <div className="hero-actions" style={{ justifyContent: "center", marginTop: 12 }}>
        <button className="btn primary" onClick={onOrganizer}>
          Modul organizator
        </button>
        <button className="btn ghost" onClick={onJoin}>
          Modul participant
        </button>
      </div>
    </div>
  );
};

export default Home;
