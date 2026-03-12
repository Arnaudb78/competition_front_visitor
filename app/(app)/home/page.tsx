"use client";

import { Settings, Zap, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getMyCompletions, getEvents, type Event } from "@/lib/challenges";

function EventCard({
  event,
  pageLoaded,
}: {
  event: { id: string; title: string; author: string; date: string; image: string | null | undefined };
  pageLoaded: boolean;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const hasImage = !!event.image;
  const ready = pageLoaded && (hasImage ? imgLoaded : true);

  return (
    <div className="flex items-center gap-3">
      {/* Thumbnail */}
      <div className="relative w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden bg-white/10">
        {!ready && <div className="absolute inset-0 skeleton rounded-xl" />}
        {hasImage ? (
          <img
            src={event.image!}
            alt={event.title}
            className="w-full h-full object-cover transition-opacity duration-300"
            style={{ opacity: imgLoaded ? 1 : 0 }}
            onLoad={() => setImgLoaded(true)}
          />
        ) : (
          <div
            className="w-full h-full bg-gradient-to-br from-purple-900/60 to-purple-600/30 transition-opacity duration-300"
            style={{ opacity: ready ? 1 : 0 }}
          />
        )}
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        {ready ? (
          <>
            <p className="text-white font-semibold text-sm truncate">{event.title}</p>
            <p className="text-white/40 text-xs mt-0.5">
              Par <span className="text-white/70 font-medium">{event.author}</span>
              {" "}•{" "}{event.date}
            </p>
          </>
        ) : (
          <>
            <div className="skeleton h-3.5 w-32 rounded mb-2" />
            <div className="skeleton h-3 w-24 rounded" />
          </>
        )}
      </div>

      {/* Bouton + */}
      <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
        <Plus className="w-4 h-4 text-white/60" strokeWidth={2} />
      </button>
    </div>
  );
}

function getCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : "";
}

function getWeeklyCount(completions: { completedAt: string }[]): number {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diffToMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - diffToMonday);
  return completions.filter((c) => new Date(c.completedAt) >= monday).length;
}

function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}

export default function HomePage() {
  const router = useRouter();
  const [spinning, setSpinning] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [weeklyCount, setWeeklyCount] = useState<number | null>(null);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    setFirstName(getCookie("account_firstName"));
    setLastName(getCookie("account_lastName"));
    Promise.all([getMyCompletions(), getEvents()]).then(([completions, evts]) => {
      setWeeklyCount(getWeeklyCount(completions));
      setEvents(evts.slice(0, 3));
    });
  }, []);

  function handleSettings() {
    if (spinning) return;
    setSpinning(true);
    setTimeout(() => router.push("/profil"), 500);
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
      <div className="rounded-2xl bg-white overflow-hidden mb-8 flex items-stretch">
        {/* Contenu texte */}
        <div className="flex-1 p-5">
          <div className="flex items-center gap-1.5 mb-3">
            <Zap className="w-3.5 h-3.5 text-amber-500" fill="currentColor" />
            <span className="text-xs text-gray-500 font-medium">
              Progrès hebdomadaires
            </span>
          </div>

          <p className="text-[#1a1a2e] text-sm font-medium leading-snug mb-4">
            Tu as accompli{" "}
            <span className="font-bold" style={{ color: "#FFCA44" }}>
              {weeklyCount !== null
                ? `${weeklyCount} défi${weeklyCount !== 1 ? "s" : ""}`
                : "…"}
            </span>{" "}
            depuis le début de la semaine !
          </p>

          <Link
            href="/jeu"
            className="inline-block px-5 py-2.5 rounded-full text-sm font-semibold text-[#1a1a2e] whitespace-nowrap"
            style={{ background: "#FFCA44" }}
          >
            Découvre le défi à venir !
          </Link>
        </div>

        {/* Personnage — flush right/bottom */}
        <div className="flex-shrink-0 self-stretch w-24 pointer-events-none select-none overflow-hidden">
          <Image
            src="/miroki_challenge.png"
            alt=""
            width={440}
            height={280}
            className="w-full h-full object-contain object-right-bottom"
          />
        </div>
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
        {weeklyCount === null
          ? Array.from({ length: 3 }).map((_, i) => (
              <EventCard
                key={i}
                event={{ id: String(i), title: "", author: "", date: "", image: null }}
                pageLoaded={false}
              />
            ))
          : events.map((evt) => (
              <EventCard
                key={evt._id}
                event={{
                  id: evt._id,
                  title: evt.title,
                  author: evt.organizer ?? "",
                  date: formatEventDate(evt.date),
                  image: evt.imageUrl ?? null,
                }}
                pageLoaded={true}
              />
            ))}
      </div>
    </div>
  );
}
