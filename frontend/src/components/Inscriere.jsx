import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { inscrieLaEveniment } from "../api";

const Inscriere = () => {
  const [cod, setCod] = useState("");
  const [nume, setNume] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [stare, setStare] = useState(null);
  const [scanErr, setScanErr] = useState("");
  const [scaneaza, setScaneaza] = useState(false);
  const [areCadru, setAreCadru] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectRef = useRef(null);
  const canvasRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMesaj("");
    setStare(null);

    if (!cod || !nume) {
      setMesaj("Completeaza codul si numele.");
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
      setMesaj(err.message || "Nu s-a putut inregistra prezenta.");
    }
  };

  const opresteScan = () => {
    setScaneaza(false);
    setAreCadru(false);
    if (detectRef.current) {
      cancelAnimationFrame(detectRef.current);
      detectRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => () => opresteScan(), []);

  const pornesteScan = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setScanErr("Camera nu e disponibila.");
      return;
    }
    try {
      setScanErr("");
      opresteScan();

      let stream = null;
      const tries = [
        { video: { facingMode: { ideal: "environment" } } },
        { video: true },
      ];
      for (const c of tries) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(c);
          break;
        } catch (e) {
          // continue
        }
      }
      if (!stream) throw new Error("no-stream");

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {});
        };
        await videoRef.current.play().catch(() => {});
      }

      setScaneaza(true);

      // daca dupa 1.5s nu avem cadru, avertizeaza
      setTimeout(() => {
        if (scaneaza && videoRef.current && (!videoRef.current.videoWidth || !videoRef.current.videoHeight)) {
          setScanErr("Camera nu trimite imagine. Permite accesul sau incearca alt browser.");
        }
      }, 1500);

      const detector = window.BarcodeDetector ? new window.BarcodeDetector({ formats: ["qr_code"] }) : null;

      const tick = async () => {
        if (!videoRef.current) return;
        try {
          if (detector) {
            const codes = await detector.detect(videoRef.current);
            if (codes && codes.length > 0) {
              const val = (codes[0].rawValue || "").trim();
              if (val) {
                setCod(val.toUpperCase());
                opresteScan();
                return;
              }
            }
          } else if (canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            if (!video.videoWidth || !video.videoHeight) {
              setAreCadru(false);
              detectRef.current = requestAnimationFrame(tick);
              return;
            }
            setAreCadru(true);
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(data.data, data.width, data.height, { inversionAttempts: "dontInvert" });
            if (code && code.data) {
              setCod(code.data.trim().toUpperCase());
              opresteScan();
              return;
            }
          }
        } catch (e) {
          // ignore detector noise
        }
        detectRef.current = requestAnimationFrame(tick);
      };

      detectRef.current = requestAnimationFrame(tick);
    } catch (err) {
      setScanErr("Nu merge camera. Permite accesul sau foloseste https/localhost.");
      opresteScan();
    }
  };

  return (
    <div className="surface">
      <h2>Confirma prezenta</h2>
      <form onSubmit={handleSubmit} className="grid">
        <div className="input-row">
          <label className="label" htmlFor="cod">Cod eveniment</label>
          <input
            id="cod"
            value={cod}
            onChange={(e) => setCod(e.target.value.toUpperCase())}
            placeholder="ABC123"
            maxLength={6}
          />
          <div className="actions" style={{ marginTop: 4 }}>
            <button className="btn ghost" type="button" onClick={pornesteScan} disabled={scaneaza}>
              Scan QR
            </button>
            {scaneaza && (
              <button className="btn text" type="button" onClick={opresteScan}>
                Opreste
              </button>
            )}
          </div>
          {scanErr && <p className="small" style={{ color: "#b91c1c" }}>{scanErr}</p>}
          {scaneaza && (
            <div style={{ marginTop: 6 }}>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{ width: "100%", maxWidth: 260, height: 200, objectFit: "cover", border: "1px solid #e5e7eb", background: "#f8fafc" }}
              />
              <canvas ref={canvasRef} style={{ display: "none" }} />
              {!areCadru && <p className="small" style={{ marginTop: 4 }}>Se asteapta imaginea de la camera...</p>}
            </div>
          )}
        </div>
        <div className="input-row">
          <label className="label" htmlFor="nume">Numele tau</label>
          <input
            id="nume"
            value={nume}
            onChange={(e) => setNume(e.target.value)}
            placeholder="Nume Prenume"
          />
        </div>
        <div className="actions">
          <button className="btn primary" type="submit">
            Confirma
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
