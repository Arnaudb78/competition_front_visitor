"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, MapPin, Users } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

interface Event {
  _id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  price: number;
  imageUrl?: string;
  organizer?: string;
  participants: string[];
  maxCapacity?: number;
}

function getAccountToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)account_token=([^;]+)/);
  return match ? match[1] : null;
}

function getAccountId(): string | null {
  if (typeof document === "undefined") return null;
  // Decode JWT sub claim without a library
  try {
    const token = getAccountToken();
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetch(`${API}/events/${id}`)
      .then((r) => r.json())
      .then((data) => { setEvent(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const accountId = getAccountId();
  const isRegistered = !!accountId && !!event?.participants.includes(accountId);
  const isFull = !!event?.maxCapacity && event.participants.length >= event.maxCapacity;
  const spotsLeft = event?.maxCapacity ? event.maxCapacity - event.participants.length : null;

  async function handleRegister() {
    const token = getAccountToken();
    if (!token) { router.push("/"); return; }
    setRegistering(true);
    try {
      const res = await fetch(`${API}/events/${id}/register`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const updated = await res.json();
        setEvent(updated);
      }
    } finally {
      setRegistering(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p className="text-white/40 text-sm animate-pulse">Chargement…</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p className="text-white/40 text-sm">Événement introuvable</p>
      </div>
    );
  }

  const dateStr = new Date(event.date).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long",
  });

  // CTA state
  const ctaDisabled = registering || (isFull && !isRegistered);
  const ctaLabel = registering
    ? "…"
    : isRegistered
    ? "Me désinscrire"
    : isFull
    ? "Complet"
    : "Je m'inscris";

  return (
    <div className="min-h-dvh pb-32">
      {/* Hero image */}
      <div className="relative w-full h-64">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900 to-purple-600" />
        )}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(13,11,30,1) 100%)" }}
        />
        <button
          onClick={() => router.back()}
          className="absolute top-12 left-5 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="absolute top-12 right-5">
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              background: event.price === 0 ? "rgba(120, 60, 180, 0.85)" : "rgba(255,202,68,0.9)",
              color: event.price === 0 ? "white" : "#1a1a2e",
            }}
          >
            {event.price === 0 ? "Gratuit" : `${event.price} €`}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 -mt-8 relative z-10">
        <h1
          className="text-white text-3xl font-bold mb-4 leading-tight"
          style={{ fontFamily: "'ESPeak', sans-serif" }}
        >
          {event.title}
        </h1>

        {/* Pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
            <Clock className="w-3.5 h-3.5 text-white/60" />
            <span className="text-white text-xs font-medium">
              {dateStr}{event.time ? ` · ${event.time}` : ""}
            </span>
          </div>
          {event.location && (
            <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
              <MapPin className="w-3.5 h-3.5 text-white/60" />
              <span className="text-white text-xs font-medium">{event.location}</span>
            </div>
          )}
        </div>

        {/* Capacity indicator */}
        {event.maxCapacity && (
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-4 h-4 text-white/40" />
            <span
              className="text-sm"
              style={{ color: spotsLeft === 0 ? "#ff6b6b" : spotsLeft !== null && spotsLeft <= 5 ? "#FFCA44" : "rgba(255,255,255,0.5)" }}
            >
              {isFull
                ? "Complet"
                : spotsLeft !== null && spotsLeft <= 5
                ? `Plus que ${spotsLeft} place${spotsLeft > 1 ? "s" : ""} !`
                : `${event.participants.length} / ${event.maxCapacity} inscrits`}
            </span>
          </div>
        )}

        {/* Description */}
        {event.description && (
          <>
            <h2
              className="text-white font-bold text-lg mb-3"
              style={{ fontFamily: "'ESPeak', sans-serif" }}
            >
              Description
            </h2>
            <p
              className="text-white/70 text-sm leading-relaxed whitespace-pre-line mb-8"
              style={{ fontFamily: "'SpaceGrotesk', sans-serif" }}
            >
              {event.description}
            </p>
          </>
        )}

        {/* CTA */}
        <button
          onClick={handleRegister}
          disabled={ctaDisabled}
          className="w-full py-4 rounded-2xl font-bold text-base transition-all active:scale-[0.98] disabled:opacity-50"
          style={{
            background: isRegistered ? "rgba(255,255,255,0.1)" : isFull ? "rgba(255,255,255,0.05)" : "white",
            color: isRegistered ? "white" : isFull ? "rgba(255,255,255,0.3)" : "#1a1a2e",
            border: isRegistered ? "1px solid rgba(255,255,255,0.2)" : "none",
            fontFamily: "'SpaceGrotesk', sans-serif",
          }}
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}
