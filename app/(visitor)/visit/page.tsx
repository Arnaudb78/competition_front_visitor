"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SplashPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  // Splash : affiche le logo 2s puis révèle le bouton
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-end min-h-dvh px-8 pb-16 select-none overflow-hidden">
      {/* Splash screen image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/splash_screen.png')" }}
      />

      {/* CTA — apparaît après le splash */}
      <div
        className="relative z-10 w-full flex flex-col items-center gap-4 transition-all duration-700"
        style={{
          opacity: ready ? 1 : 0,
          transform: ready ? "translateY(0)" : "translateY(16px)",
        }}
      >
        <button
          onClick={() => router.push("/visit/participants")}
          disabled={!ready}
          className="w-full max-w-xs py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 active:scale-95 transition-all font-semibold text-white text-lg shadow-lg shadow-purple-900/40"
        >
          Démarrer la visite
        </button>
      </div>
    </div>
  );
}
