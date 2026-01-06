import { useCallback, useEffect, useRef, useState } from "react";
import { inscrieLaEveniment } from "../api";
import jsQR from "jsqr";

const Inscriere = () => {
  const [cod, setCod] = useState("");
  const [nume, setNume] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [stare, setStare] = useState(null);
  const [scaneaza, setScaneaza] = useState(false);
  const [cameraGata, setCameraGata] = useState(false);
  const [eroareScanare, setEroareScanare] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const streamRef = useRef(null);

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

  const stopScanner = useCallback(() => {
    setScaneaza(false);
    setCameraGata(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const tick = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(video, 0, 0, w, h);
    const imageData = ctx.getImageData(0, 0, w, h);
    const codeResult = jsQR(imageData.data, w, h);
    if (codeResult && codeResult.data) {
      setCod(codeResult.data.toUpperCase());
      setMesaj("Cod QR detectat, apasă Confirmă.");
      stopScanner();
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  };

  const startScanner = async () => {
    setEroareScanare("");
    setCameraGata(false);
    try {
      setScaneaza(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        videoRef.current.onloadedmetadata = () => setCameraGata(true);
      }
      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      setEroareScanare("Nu pot porni camera. Permite accesul video.");
    }
  };

  useEffect(() => {
    return () => stopScanner();
  }, [stopScanner]);

  return (
    <div className="surface">
      <h2>Confirmă prezența</h2>
      <p className="small">Introdu codul de 6 caractere și numele tău.</p>
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
          <div className="actions" style={{ gap: 6, marginTop: 6 }}>
            <button type="button" className="btn ghost" onClick={startScanner} disabled={scaneaza}>
              {scaneaza ? "Scanner activ" : "Scanează QR"}
            </button>
            {scaneaza && (
              <button type="button" className="btn text" onClick={stopScanner}>
                Oprește
              </button>
            )}
          </div>
          {eroareScanare && <p className="small" style={{ color: "#b91c1c" }}>{eroareScanare}</p>}
          {scaneaza && (
            <div style={{ marginTop: 8 }}>
              <div className="small" style={{ marginBottom: 6 }}>
                Previzualizare cameră (QR trebuie să fie clar în cadru)
              </div>
              <video
                ref={videoRef}
                style={{
                  width: "100%",
                  maxWidth: "520px",
                  aspectRatio: "4 / 3",
                  background: "#f8fafc",
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  objectFit: "cover",
                  display: "block",
                }}
                muted
                playsInline
                autoPlay
              />
              <canvas ref={canvasRef} style={{ display: "none" }} />
              <p className="small">
                {cameraGata
                  ? "Îndreaptă camera spre codul QR al evenimentului."
                  : "Se pornește camera... dacă nu apare imaginea, permite accesul video sau încearcă camera frontală."}
              </p>
            </div>
          )}
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
          <p className="small" style={{ color: stare === "error" ? "#b91c1c" : "#15803d" }}>
            {mesaj}
          </p>
        )}
      </form>
    </div>
  );
};

export default Inscriere;
