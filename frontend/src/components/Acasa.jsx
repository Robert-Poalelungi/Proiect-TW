const Acasa = ({ peOrganizator, peInscriere }) => {
  return (
    <div className="surface" style={{ textAlign: "center" }}>
      <h2>Alege modul</h2>
      <div className="hero-actions" style={{ justifyContent: "center", marginTop: 12 }}>
        <button className="btn primary" onClick={peOrganizator}>
          Modul organizator
        </button>
        <button className="btn ghost" onClick={peInscriere}>
          Modul participant
        </button>
      </div>
    </div>
  );
};

export default Acasa;
