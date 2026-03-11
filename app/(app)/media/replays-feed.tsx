"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Clock } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

interface Replay {
  _id: string;
  title: string;
  description?: string;
  languages: string[];
  videoUrl: string;
  thumbnailUrl?: string;
  createdAt: string;
}

type Filter = "all" | "week" | "month";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Il y a 1 jour";
  return `Il y a ${days} jours`;
}

function filterReplays(replays: Replay[], filter: Filter): Replay[] {
  if (filter === "all") return replays;
  const now = Date.now();
  const cutoff = filter === "week" ? 7 : 30;
  return replays.filter((r) => {
    const diff = now - new Date(r.createdAt).getTime();
    return diff <= cutoff * 24 * 60 * 60 * 1000;
  });
}

export function ReplaysFeed() {
  const [replays, setReplays] = useState<Replay[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch(`${API}/replays`)
      .then((r) => r.json())
      .then((data) => {
        setReplays(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "Tout" },
    { id: "week", label: "Cette semaine" },
    { id: "month", label: "Ce mois" },
  ];

  const displayed = filterReplays(replays, filter);

  return (
    <div className="px-5 pt-4 pb-32">
      {/* Filtres */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f.id
                ? "bg-[#FFCA44] text-[#1a1a2e]"
                : "bg-white/10 text-white/70"
            }`}
            style={{ fontFamily: "'SpaceGrotesk', sans-serif" }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <p className="text-white/40 text-sm animate-pulse text-center mt-16">
          Chargement…
        </p>
      ) : displayed.length === 0 ? (
        <p className="text-white/40 text-sm text-center mt-16">
          Aucun replay disponible
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {displayed.map((replay) => (
            <button
              key={replay._id}
              onClick={() => router.push(`/media/replays/${replay._id}`)}
              className="w-full text-left rounded-2xl overflow-hidden bg-white/5 border border-white/10 active:scale-[0.98] transition-transform"
            >
              {/* Thumbnail */}
              <div className="relative w-full aspect-video bg-black/40">
                {replay.thumbnailUrl ? (
                  <img
                    src={replay.thumbnailUrl}
                    alt={replay.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-10 h-10 text-white/20" />
                  </div>
                )}
                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </div>
                </div>
                {/* Languages badges */}
                {replay.languages.length > 0 && (
                  <div className="absolute top-2 left-2 flex gap-1">
                    {replay.languages.map((lang) => (
                      <span
                        key={lang}
                        className="px-2 py-0.5 rounded-md bg-black/60 text-white text-xs font-medium uppercase backdrop-blur-sm"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Infos */}
              <div className="px-4 py-3">
                <p
                  className="text-white font-semibold text-base leading-snug"
                  style={{ fontFamily: "'SpaceGrotesk', sans-serif" }}
                >
                  {replay.title}
                </p>
                {replay.description && (
                  <p className="text-white/50 text-sm mt-1 line-clamp-2">
                    {replay.description}
                  </p>
                )}
                <div className="flex items-center gap-1 mt-2">
                  <Clock className="w-3.5 h-3.5 text-white/30" />
                  <span className="text-white/40 text-xs">
                    {timeAgo(replay.createdAt)}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
