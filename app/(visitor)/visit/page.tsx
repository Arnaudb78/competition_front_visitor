"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SplashPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="relative flex flex-col items-center h-dvh overflow-hidden select-none"
      style={{
        background:
          "radial-gradient(ellipse at 50% 25%, #2a1a5e 0%, #0d0b1e 55%, #080612 100%)",
      }}
    >
      {/* Title */}
      <div className="relative z-10 mt-16 px-10 w-full max-w-sm">
        <Image
          src="/title_splash.png"
          alt="Mirokaï Experience"
          width={400}
          height={120}
          className="w-full h-auto"
          priority
        />
      </div>

      {/* Character — large, centered, bleeds off bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full flex justify-center">
        <Image
          src="/miroka_splash.png"
          alt=""
          width={600}
          height={800}
          className="object-contain object-bottom"
          style={{ height: "68vh", width: "auto" }}
          priority
        />
      </div>

      {/* CTA */}
      <div
        className="relative z-10 mt-auto w-full px-8 pb-14 transition-all duration-700"
        style={{
          opacity: ready ? 1 : 0,
          transform: ready ? "translateY(0)" : "translateY(16px)",
        }}
      >
        <button
          onClick={() => router.push("/visit/participants")}
          disabled={!ready}
          className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 active:scale-95 transition-all font-semibold text-white text-lg shadow-lg shadow-purple-900/40"
        >
          Démarrer la visite
        </button>
      </div>
    </div>
  );
}
