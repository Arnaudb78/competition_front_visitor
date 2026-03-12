"use client";

import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function DesktopBlockPage() {
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(`${window.location.origin}/visit`);
  }, []);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-dvh px-8 text-center gap-6"
      style={{
        background:
          "radial-gradient(ellipse at 50% 25%, #2a1a5e 0%, #0d0b1e 55%, #080612 100%)",
      }}
    >
      <Image
        src="/kids_finish_module.png"
        alt="Mirokaï"
        width={200}
        height={220}
        className="object-contain drop-shadow-xl"
        priority
      />

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
