"use client";

import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";

export default function DesktopBlockPage() {
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(`${window.location.origin}/visit`);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-8 text-center gap-8">
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-black"
        style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
      >
        M
      </div>

      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold text-white">
          Expérience mobile uniquement
        </h1>
        <p className="text-white/60 text-sm leading-relaxed">
          Scannez ce QR code avec votre téléphone
          <br />
          pour commencer la visite Mirokaï.
        </p>
      </div>

      {url && (
        <div className="bg-white p-4 rounded-2xl shadow-lg shadow-purple-900/30">
          <QRCodeSVG value={url} size={200} />
        </div>
      )}

      <p className="text-white/30 text-xs">{url}</p>
    </div>
  );
}
