"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ThumbsUp, Share2, Volume2, VolumeX, Repeat2, Play } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

interface Clip {
  _id: string;
  title: string;
  author: string;
  videoUrl: string;
  thumbnailUrl?: string;
  likedBy: string[];
  createdAt: string;
}

type Tab = "replays" | "live" | "clips";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Il y a 1 jour";
  return `Il y a ${days} jours`;
}

function getAccountToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)account_token=([^;]+)/);
  return match ? match[1] : null;
}

function ClipItem({
  clip,
  isActive,
}: {
  clip: Clip;
  isActive: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(clip.likedBy.length);

  // Sync playing state via native video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, []);

  // Autoplay / pause selon si la clip est active
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive) {
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isActive]);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }

  async function toggleLike() {
    const token = getAccountToken();
    if (!token) return;
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => (next ? c + 1 : c - 1));
    await fetch(`${API}/clips/${clip._id}/like`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  function handleShare() {
    navigator.share?.({
      title: clip.title,
      text: `Par ${clip.author}`,
      url: window.location.href,
    }).catch(() => {});
  }

  return (
    <div className="relative w-full h-dvh flex-shrink-0 snap-start overflow-hidden bg-black">
      {/* Vidéo */}
      <video
        ref={videoRef}
        src={isActive ? clip.videoUrl : undefined}
        poster={clip.thumbnailUrl}
        preload={isActive ? "metadata" : "none"}
        loop
        muted={muted}
        playsInline
        onClick={togglePlay}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay sombre bas */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

      {/* Bouton play centré quand pausé */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/40 flex items-center justify-center">
            <Play className="w-7 h-7 text-white fill-white ml-1" />
          </div>
        </div>
      )}

      {/* Actions droite */}
      <div className="absolute right-4 bottom-28 flex flex-col items-center gap-6">
        {/* Like */}
        <button onClick={toggleLike} className="flex flex-col items-center gap-1">
          <ThumbsUp
            className={`w-7 h-7 transition-colors ${liked ? "text-[#FFCA44] fill-[#FFCA44]" : "text-white"}`}
            strokeWidth={1.5}
          />
          <span className="text-white text-xs font-medium">{likeCount}</span>
        </button>

        {/* Share */}
        <button onClick={handleShare} className="flex flex-col items-center gap-1">
          <Share2 className="w-7 h-7 text-white" strokeWidth={1.5} />
        </button>

        {/* Son */}
        <button onClick={toggleMute} className="flex flex-col items-center gap-1">
          {muted ? (
            <VolumeX className="w-7 h-7 text-white" strokeWidth={1.5} />
          ) : (
            <Volume2 className="w-7 h-7 text-white" strokeWidth={1.5} />
          )}
        </button>

        {/* Repost */}
        <button className="flex flex-col items-center gap-1">
          <Repeat2 className="w-7 h-7 text-white" strokeWidth={1.5} />
        </button>
      </div>

      {/* Infos bas gauche */}
      <div className="absolute left-4 bottom-28 right-20 pr-2">
        <p className="text-white font-bold text-base leading-snug drop-shadow-lg">
          {clip.title}
        </p>
        <p className="text-white/70 text-sm mt-1 drop-shadow">
          {timeAgo(clip.createdAt)} par{" "}
          <span className="font-semibold text-white">{clip.author}</span>
        </p>
      </div>
    </div>
  );
}

export function ClipsFeed({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: { id: Tab; label: string }[];
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}) {
  const [clips, setClips] = useState<Clip[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API}/clips`)
      .then((r) => r.json())
      .then(setClips)
      .catch(() => {});
  }, []);

  // IntersectionObserver : détecte quelle clip est visible
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setupObserver = useCallback(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number((entry.target as HTMLElement).dataset.index);
            setActiveIndex(index);
          }
        });
      },
      { threshold: 0.7 }
    );

    const items = containerRef.current?.querySelectorAll("[data-index]");
    items?.forEach((el) => observerRef.current?.observe(el));
  }, []);

  useEffect(() => {
    if (clips.length > 0) setupObserver();
    return () => observerRef.current?.disconnect();
  }, [clips, setupObserver]);

  return (
    <div className="fixed inset-0 z-40 bg-black">
      {/* Tabs overlay */}
      <div className="absolute top-0 inset-x-0 z-10 flex items-center gap-6 px-5 pt-12 pb-4"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`text-base font-medium pb-0.5 border-b-2 transition-colors ${
              activeTab === tab.id
                ? "text-white border-white"
                : "text-white/50 border-transparent"
            }`}
            style={{ fontFamily: "'SpaceGrotesk', sans-serif" }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Feed snap scroll */}
      {clips.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-white/40 text-sm animate-pulse">Chargement…</p>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="h-full overflow-y-scroll"
          style={{ scrollSnapType: "y mandatory" }}
        >
          {clips.map((clip, i) => (
            <div key={clip._id} data-index={i}>
              <ClipItem clip={clip} isActive={i === activeIndex} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
