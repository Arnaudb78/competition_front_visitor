"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Trophy, CheckCircle2 } from "lucide-react";
import {
  getChallenges,
  getMyCompletions,
  getMyProfile,
  type Challenge,
  type ChallengeCompletion,
  type MyProfile,
} from "@/lib/challenges";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return "";
  }
}

function completionName(c: ChallengeCompletion): string {
  if (typeof c.challengeId === "object" && c.challengeId !== null) {
    return c.challengeId.name;
  }
  return "Challenge";
}

function completionImage(c: ChallengeCompletion): string | null {
  if (typeof c.challengeId === "object" && c.challengeId !== null) {
    return c.challengeId.imageUrl || null;
  }
  return null;
}

function completionChallengeId(c: ChallengeCompletion): string {
  if (typeof c.challengeId === "object" && c.challengeId !== null) {
    return c.challengeId._id;
  }
  return c.challengeId as string;
}

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [completions, setCompletions] = useState<ChallengeCompletion[]>([]);
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getChallenges(), getMyCompletions(), getMyProfile()])
      .then(([ch, co, pr]) => {
        setChallenges(ch.filter((c) => c.isVisible));
        setCompletions(co);
        setProfile(pr);
      })
      .finally(() => setLoading(false));
  }, []);

  const completedIds = new Set(completions.map(completionChallengeId));

  return (
    <div className="min-h-dvh px-5 pt-14 pb-32 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Link
            href="/jeu"
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-transform"
          >
            <ChevronLeft className="w-5 h-5 text-white/80" />
          </Link>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "'ESPeak', sans-serif" }}
          >
            Challenges
          </h1>
        </div>
        {profile !== null && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10">
            <Trophy className="w-4 h-4 text-[#FFCA44]" fill="currentColor" />
            <span className="text-[#FFCA44] font-bold text-sm">
              {profile.trophies ?? 0}
            </span>
          </div>
        )}
      </div>

      {/* Horizontal scroll row of challenge cards */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        </div>
      ) : challenges.length === 0 ? (
        <p className="text-white/30 text-sm mb-8">
          Aucun challenge disponible pour l'instant.
        </p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 mb-8 -mx-5 px-5 scrollbar-none">
          {challenges.map((challenge) => {
            const done = completedIds.has(challenge._id);
            return (
              <Link
                key={challenge._id}
                href={`/jeu/challenge/${challenge._id}`}
                className="flex-shrink-0 active:scale-95 transition-transform"
                style={{ width: 160 }}
              >
                <div
                  className="relative rounded-2xl overflow-hidden flex flex-col justify-end"
                  style={{ height: 200 }}
                >
                  {/* Background image or gradient */}
                  {challenge.imageUrl ? (
                    <img
                      src={challenge.imageUrl}
                      alt={challenge.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(135deg, #4f0b8c 0%, #8b2fc9 100%)",
                      }}
                    />
                  )}

                  {/* Dark gradient overlay at bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Completed badge */}
                  {done && (
                    <div className="absolute top-2.5 right-2.5 z-10">
                      <CheckCircle2
                        className="w-5 h-5 text-[#FFCA44]"
                        fill="rgba(0,0,0,0.5)"
                        strokeWidth={2}
                      />
                    </div>
                  )}

                  {/* Name */}
                  <div className="relative z-10 p-3">
                    <p className="text-white font-bold text-sm leading-snug line-clamp-2">
                      {challenge.name}
                    </p>
                    {done && (
                      <p className="text-[#FFCA44] text-xs mt-0.5 font-medium">
                        Terminé
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Challenges terminés */}
      <h2
        className="text-white text-lg font-semibold mb-4"
        style={{ fontFamily: "'ESPeak', sans-serif" }}
      >
        Challenges terminés
      </h2>

      {completions.length === 0 ? (
        <p className="text-white/30 text-sm">
          Aucun challenge terminé pour l'instant.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {completions.map((c) => {
            const img = completionImage(c);
            const name = completionName(c);
            return (
              <div key={c._id} className="flex items-center gap-3">
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden bg-white/10">
                  {img ? (
                    <img
                      src={img}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-900/60 to-purple-600/30" />
                  )}
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">
                    {name}
                  </p>
                  <p className="text-white/40 text-xs mt-0.5">
                    Par{" "}
                    <span className="text-white/70 font-medium">
                      {profile?.firstName ?? "Moi"}
                    </span>{" "}
                    • {formatDate(c.completedAt)}
                  </p>
                </div>

                {/* Score */}
                <div className="flex-shrink-0 text-right">
                  <span className="text-[#FFCA44] font-bold text-sm">
                    {c.score} pts
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
