import { useState } from "react";
import Organizator from "./components/Organizator";
import Inscriere from "./components/Inscriere";
import DetaliiEveniment from "./components/DetaliiEveniment";
import "./App.css";

function App() {
	const [pagina, seteazaPagina] = useState("organizator");
	const [evenimentSelectatId, seteazaEvenimentSelectatId] = useState(null);

	const deschideOrganizator = () => {
		seteazaEvenimentSelectatId(null);
		seteazaPagina("organizator");
	};

	const deschideInscriere = () => {
		seteazaEvenimentSelectatId(null);
		seteazaPagina("inscriere");
	};

	const deschideDetaliiEveniment = (idEveniment) => {
		seteazaEvenimentSelectatId(idEveniment);
		seteazaPagina("detalii");
	};

	return (
		<div className="app-shell">
			<h1 className="title">Aplicatie prezenta</h1>
			<div className="actions" style={{ marginBottom: 12 }}>
				<button className="btn ghost" onClick={deschideOrganizator}>Organizator</button>
				<button className="btn ghost" onClick={deschideInscriere}>Participant</button>
				{pagina === "detalii" && (
					<button className="btn text" onClick={deschideOrganizator}>Inapoi</button>
				)}
			</div>

			<div className="content">
				{pagina === "organizator" && <Organizator peDeschideEveniment={deschideDetaliiEveniment} />}
				{pagina === "inscriere" && <Inscriere />}
				{pagina === "detalii" && evenimentSelectatId && (
					<DetaliiEveniment eventId={evenimentSelectatId} onBack={deschideOrganizator} />
				)}
			</div>
		</div>
	);
}

export default App;
