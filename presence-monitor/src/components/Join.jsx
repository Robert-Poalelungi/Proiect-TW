import { useEffect, useRef, useState } from "react";
import { joinEvent } from "../api";
import jsQR from "jsqr";

const Join = () => {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [scanError, setScanError] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const streamRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setStatus(null);

    if (!code || !name) {
      setMessage("Completează codul și numele.");
      return;
    }

    try {
      const res = await joinEvent({ code, name });
      setStatus("success");
      setMessage(`Ai intrat la ${res.event.name}. Status: ${res.event.status}.`);
      setCode("");
      setName("");
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Nu s-a putut înregistra prezența.");
    }
  };

  const stopScanner = () => {
    setScanning(false);
    setCameraReady(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const tick = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
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
      setCode(codeResult.data.toUpperCase());
      setMessage("Cod QR detectat, apasă Confirmă.");
      stopScanner();
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  };

  const startScanner = async () => {
    setScanError("");
    setCameraReady(false);
    try {
      setScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        videoRef.current.onloadedmetadata = () => setCameraReady(true);
      }
      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      setScanError("Nu pot porni camera. Permite accesul video.");
    }
  };

  useEffect(() => {
    return () => stopScanner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="surface">
      <h2>Confirmă prezența</h2>
      <p className="small">Introdu codul de 6 caractere și numele tău.</p>
      <form onSubmit={handleSubmit} className="grid">
        <div className="input-row">
          <label className="label" htmlFor="code">
            Cod eveniment
          </label>
          <input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            maxLength={6}
          />
          <div className="actions" style={{ gap: 6, marginTop: 6 }}>
            <button type="button" className="btn ghost" onClick={startScanner} disabled={scanning}>
              {scanning ? "Scanner activ" : "Scanează QR"}
            </button>
            {scanning && (
              <button type="button" className="btn text" onClick={stopScanner}>
                Oprește
              </button>
            )}
          </div>
          {scanError && <p className="small" style={{ color: "#b91c1c" }}>{scanError}</p>}
          {scanning && (
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
                {cameraReady
                  ? "Îndreaptă camera spre codul QR al evenimentului."
                  : "Se pornește camera... dacă nu apare imaginea, permite accesul video sau încearcă camera frontală."}
              </p>
            </div>
          )}
        </div>
        <div className="input-row">
          <label className="label" htmlFor="name">
            Numele tău
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Prenume Nume"
          />
        </div>
        <div className="actions">
          <button className="btn primary" type="submit">
            Confirmă prezența
          </button>
        </div>
        {message && (
          <p className="small" style={{ color: status === "error" ? "#b91c1c" : "#15803d" }}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default Join;
