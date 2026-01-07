const Acasa = ({ peOrganizator, peInscriere }) => {
  return (
    <div className="surface" style={{ textAlign: "center" }}>
      <h2>Start</h2>
      <div className="actions" style={{ justifyContent: "center" }}>
        <button className="btn primary" onClick={peOrganizator}>Organizator</button>
        <button className="btn ghost" onClick={peInscriere}>Participant</button>
      </div>
    </div>
  );
};

export default Acasa;
