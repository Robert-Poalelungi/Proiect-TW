import { useState } from "react";
import Acasa from "./components/Acasa";
import Organizator from "./components/Organizator";
import Inscriere from "./components/Inscriere";
import DetaliiEveniment from "./components/DetaliiEveniment";
import "./App.css";

function App() {
	const [pagina, seteazaPagina] = useState("acasa");
	const [evenimentSelectatId, seteazaEvenimentSelectatId] = useState(null);

	const mergiAcasa = () => {
		seteazaEvenimentSelectatId(null);
		seteazaPagina("acasa");
	};

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
			<header className="hero">
				<div className="hero-copy">
					<h1>Aplicație Prezență</h1>
					<div className="hero-actions">
						<button className="btn primary" onClick={deschideOrganizator}>
							Modul organizator
						</button>
						<button className="btn ghost" onClick={deschideInscriere}>
							Modul participant
						</button>
					</div>
				</div>
			</header>

			<main className="panel">
				{pagina === "acasa" && <Acasa peOrganizator={deschideOrganizator} peInscriere={deschideInscriere} />}
				{pagina === "organizator" && <Organizator peDeschideEveniment={deschideDetaliiEveniment} />}
				{pagina === "inscriere" && <Inscriere />}
				{pagina === "detalii" && evenimentSelectatId && (
					<DetaliiEveniment eventId={evenimentSelectatId} onBack={deschideOrganizator} />
				)}
			</main>
		</div>
	);
}

export default App;
