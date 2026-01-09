import { useState } from "react";
import Organizator from "./components/Organizator";
import Inscriere from "./components/Inscriere";
import DetaliiEveniment from "./components/DetaliiEveniment";
import "./App.css";

// Shell-ul aplicatiei: comută între organizator, participant și detalii
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
			<header className="app-header">
				<div className="app-title">
					<h1>Aplicație prezență</h1>
				</div>
				<div className="app-nav">
					<button className={`btn ${pagina === "organizator" ? "primary" : "ghost"}`} onClick={deschideOrganizator}>
						Organizator
					</button>
					<button className={`btn ${pagina === "inscriere" ? "primary" : "ghost"}`} onClick={deschideInscriere}>
						Participant
					</button>
				</div>
			</header>

			<div className="content">
				<main className="panel">
					{pagina === "organizator" && <Organizator peDeschideEveniment={deschideDetaliiEveniment} />}
					{pagina === "inscriere" && <Inscriere />}
					{pagina === "detalii" && evenimentSelectatId && (
						<DetaliiEveniment eventId={evenimentSelectatId} onBack={deschideOrganizator} />
					)}
				</main>
			</div>
		</div>
	);
}

export default App;
