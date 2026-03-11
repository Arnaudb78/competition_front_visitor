"use client";

import { Settings, Zap, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

function getCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : "";
}

const MOCK_EVENTS = [
  {
    id: "1",
    title: "Robot Drinks",
    author: "Enchanted Tools",
    date: "19 mars",
    image: null,
  },
  {
    id: "2",
    title: "Enchanted Talk",
    author: "Marie Aumont",
    date: "5 mars",
    image: null,
  },
  {
    id: "3",
    title: "Enchanted Talk",
    author: "Marie Aumont",
    date: "5 mars",
    image: null,
  },
  {
    id: "4",
    title: "Talk",
    author: "Marie Aumont",
    date: "5 mars",
    image: null,
  },
];

export default function HomePage() {
  const router = useRouter();
  const [spinning, setSpinning] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    setFirstName(getCookie("account_firstName"));
    setLastName(getCookie("account_lastName"));
  }, []);

  function handleSettings() {
    if (spinning) return;
    setSpinning(true);
    setTimeout(() => {
      router.push("/profil");
    }, 500);
  }

  return (
    <div className="min-h-dvh px-5 pt-14 pb-32">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p
            className="text-white text-3xl font-light leading-tight"
            style={{ fontFamily: "'ESPeak', sans-serif" }}
          >
            Salut,
          </p>
          <p
            className="text-3xl font-bold leading-tight"
            style={{ fontFamily: "'ESPeak', sans-serif", color: "#FFCA44" }}
          >
            {firstName} {lastName}
          </p>
        </div>
        <button
          onClick={handleSettings}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mt-1 active:scale-90 transition-transform"
        >
          <Settings
            className="w-5 h-5 text-white/70"
            strokeWidth={1.5}
            style={{
              transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
              transform: spinning ? "rotate(180deg)" : "rotate(0deg)",
            }}
            onTransitionEnd={() => setSpinning(false)}
          />
        </button>
      </div>

      {/* Card progrès hebdomadaires */}
      <div className="relative rounded-2xl bg-white overflow-hidden mb-8 p-5 pr-28">
        {/* Illustration robot (placeholder) */}
        <div className="absolute right-0 bottom-0 w-28 h-full flex items-end justify-center pointer-events-none select-none">
          <div className="w-24 h-24 rounded-full bg-amber-100/30" />
        </div>

        <div className="flex items-center gap-1.5 mb-3">
          <Zap className="w-3.5 h-3.5 text-amber-500" fill="currentColor" />
          <span className="text-xs text-gray-500 font-medium">
            Progrès hebdomadaires
          </span>
        </div>

        <p className="text-[#1a1a2e] text-sm font-medium leading-snug mb-4">
          Tu as accompli{" "}
          <span className="font-bold" style={{ color: "#FFCA44" }}>
            4 défis
          </span>{" "}
          depuis le début de la semaine !
        </p>

        <button
          className="px-5 py-2.5 rounded-full text-sm font-semibold text-[#1a1a2e]"
          style={{ background: "#FFCA44" }}
        >
          Découvre le défi à venir !
        </button>
      </div>

      {/* Section événements */}
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-white text-lg font-semibold"
          style={{ fontFamily: "'ESPeak', sans-serif" }}
        >
          Les derniers évènements
        </h2>
        <Link href="/calendrier" className="text-white/40 text-sm">
          Tout voir
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {MOCK_EVENTS.map((event) => (
          <div key={event.id} className="flex items-center gap-3">
            {/* Thumbnail */}
            <div className="w-16 h-16 rounded-xl bg-white/10 flex-shrink-0 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-purple-900/60 to-purple-600/30" />
            </div>

            {/* Infos */}
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">
                {event.title}
              </p>
              <p className="text-white/40 text-xs mt-0.5">
                Par{" "}
                <span className="text-white/70 font-medium">{event.author}</span>
                {" "}•{" "}{event.date}
              </p>
            </div>

            {/* Bouton + */}
            <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <Plus className="w-4 h-4 text-white/60" strokeWidth={2} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
