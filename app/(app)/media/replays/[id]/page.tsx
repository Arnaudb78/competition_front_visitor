"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Send, Heart } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

interface Comment {
  author: string;
  text: string;
  createdAt: string;
}

interface Replay {
  _id: string;
  title: string;
  description?: string;
  languages: string[];
  videoUrl: string;
  thumbnailUrl?: string;
  createdAt: string;
  comments: Comment[];
}

function getAccountToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)account_token=([^;]+)/);
  return match ? match[1] : null;
}

function getAccountName(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)account_name=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export default function ReplayDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const commentsListRef = useRef<HTMLDivElement>(null);

  const [replay, setReplay] = useState<Replay | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([]);
  const heartIdRef = useRef(0);

  useEffect(() => {
    fetch(`${API}/replays/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setReplay(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

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
  }, [replay]);

  // Auto-scroll comments to bottom when new one added
  useEffect(() => {
    const el = commentsListRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [replay?.comments.length]);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play();
    else video.pause();
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }

  function spawnHeart() {
    const newId = heartIdRef.current++;
    const x = 60 + Math.random() * 30; // right side, random spread
    setHearts((prev) => [...prev, { id: newId, x }]);
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== newId));
    }, 1200);
  }

  async function submitComment() {
    if (!commentText.trim() || !replay) return;
    const token = getAccountToken();
    if (!token) return;
    const author = getAccountName() ?? "Anonyme";
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/replays/${replay._id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ author, text: commentText.trim() }),
      });
      if (res.ok) {
        const updated = await res.json();
        setReplay(updated);
        setCommentText("");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <p className="text-white/40 text-sm animate-pulse">Chargement…</p>
      </div>
    );
  }

  if (!replay) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <p className="text-white/40 text-sm">Replay introuvable</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-40 flex flex-col">
      {/* Background video */}
      <video
        ref={videoRef}
        src={replay.videoUrl}
        poster={replay.thumbnailUrl}
        playsInline
        preload="metadata"
        onClick={togglePlay}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.5) 100%)",
        }}
      />

      {/* Floating hearts animation */}
      {hearts.map((h) => (
        <div
          key={h.id}
          className="absolute pointer-events-none"
          style={{
            right: `${100 - h.x}%`,
            bottom: "140px",
            animation: "floatHeart 1.2s ease-out forwards",
          }}
        >
          <Heart className="w-7 h-7 fill-[#ff4d6d] text-[#ff4d6d]" />
        </div>
      ))}

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-12 pb-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <div className="flex items-center gap-2">
          {replay.languages.map((lang) => (
            <span
              key={lang}
              className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white/80 text-xs font-semibold uppercase"
            >
              {lang}
            </span>
          ))}
          <span
            className="px-3 py-1 rounded-full text-white text-xs font-bold uppercase"
            style={{ background: "rgba(120, 60, 180, 0.85)" }}
          >
            REPLAY
          </span>
        </div>
      </div>

      {/* Play/pause center (shown only when paused) */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <Play className="w-7 h-7 text-white fill-white ml-1" />
          </div>
        </div>
      )}

      {/* Mute button top right */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleMute(); }}
        className="absolute top-12 right-16 z-10 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
      >
        {muted ? (
          <VolumeX className="w-4 h-4 text-white" />
        ) : (
          <Volume2 className="w-4 h-4 text-white" />
        )}
      </button>

      {/* Bottom overlay: comments + input */}
      <div className="absolute bottom-0 inset-x-0 z-10 pb-28 flex flex-col" style={{ maxHeight: "55%" }}>
        {/* Title */}
        <div className="px-5 mb-3">
          <p
            className="text-white font-bold text-base drop-shadow-lg"
            style={{ fontFamily: "'SpaceGrotesk', sans-serif" }}
          >
            {replay.title}
          </p>
          {replay.description && (
            <p className="text-white/60 text-xs mt-0.5 line-clamp-1">
              {replay.description}
            </p>
          )}
        </div>

        {/* Scrollable comments */}
        <div
          ref={commentsListRef}
          className="flex-1 overflow-y-auto px-5 flex flex-col justify-end gap-2 no-scrollbar"
          style={{ minHeight: 0 }}
        >
          {replay.comments.length === 0 ? (
            <p className="text-white/30 text-sm mb-2">Soyez le premier à commenter…</p>
          ) : (
            replay.comments.map((c, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                  <span className="text-white text-xs font-bold uppercase">
                    {c.author.charAt(0)}
                  </span>
                </div>
                <div className="bg-black/40 backdrop-blur-sm rounded-2xl rounded-tl-sm px-3 py-1.5 max-w-[80%]">
                  <span
                    className="text-[#FFCA44] text-xs font-semibold mr-1.5"
                    style={{ fontFamily: "'SpaceGrotesk', sans-serif" }}
                  >
                    @{c.author}
                  </span>
                  <span className="text-white text-sm leading-snug">{c.text}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input row */}
        <div className="flex items-center gap-3 px-5 mt-3">
          <div className="flex-1 flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/20 rounded-full px-4 py-2.5">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitComment();
                }
              }}
              placeholder="Commenter…"
              className="flex-1 bg-transparent text-white text-sm placeholder-white/40 outline-none"
              style={{ fontFamily: "'SpaceGrotesk', sans-serif" }}
            />
            <button
              onClick={submitComment}
              disabled={!commentText.trim() || submitting}
              className="text-[#FFCA44] disabled:text-white/20 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Heart button */}
          <button
            onClick={spawnHeart}
            className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center flex-shrink-0"
          >
            <Heart className="w-5 h-5 text-white" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes floatHeart {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          50% { transform: translateY(-60px) scale(1.2); opacity: 0.8; }
          100% { transform: translateY(-120px) scale(0.8); opacity: 0; }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
