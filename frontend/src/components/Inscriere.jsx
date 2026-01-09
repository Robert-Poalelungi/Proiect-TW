import { useState } from "react";
import { inscrieLaEveniment } from "../api";

// Formulă pentru înscrierea unui participant pe baza codului evenimentului
const Inscriere = () => {
  const [cod, setCod] = useState("");
  const [nume, setNume] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [stare, setStare] = useState(null);

  // Trimite cererea de înscriere și gestionează mesajele de răspuns
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMesaj("");
    setStare(null);

    if (!cod || !nume) {
      setMesaj("Completează codul și numele.");
      return;
    }

    try {
      const res = await inscrieLaEveniment({ cod, nume });
      setStare("success");
      setMesaj(`Ai intrat la ${res.eveniment.nume}. Status: ${res.eveniment.status}.`);
      setCod("");
      setNume("");
    } catch (err) {
      setStare("error");
      setMesaj(err.message || "Nu s-a putut înregistra prezența.");
    }
  };

  return (
    <div className="detail-card">
      <h2>Confirmă prezența</h2>
      <form onSubmit={handleSubmit} className="grid">
        <div className="input-row">
          <label className="label" htmlFor="cod">
            Cod eveniment
          </label>
          <input
            id="cod"
            value={cod}
            onChange={(e) => setCod(e.target.value.toUpperCase())}
            placeholder="ABC123"
            maxLength={6}
          />
        </div>
        <div className="input-row">
          <label className="label" htmlFor="nume">
            Numele tău
          </label>
          <input
            id="nume"
            value={nume}
            onChange={(e) => setNume(e.target.value)}
            placeholder="Nume Prenume"
          />
        </div>
        <div className="actions">
          <button className="btn primary" type="submit">
            Confirmă prezența
          </button>
        </div>
        {mesaj && (
          <p className="small" style={{ color: stare === "error" ? "#c1121f" : "#1c7c3a" }}>
            {mesaj}
          </p>
        )}
      </form>
    </div>
  );
};

export default Inscriere;
