"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, ChevronRight } from "lucide-react";
import {
  getMyProfile,
  getMyCompletions,
  type ChallengeCompletion,
  type MyProfile,
} from "@/lib/challenges";

function completionChallengeId(c: ChallengeCompletion): string {
  if (typeof c.challengeId === "object" && c.challengeId !== null) {
    return c.challengeId._id;
  }
  return c.challengeId as string;
}

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

export default function JeuPage() {
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [completions, setCompletions] = useState<ChallengeCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyProfile(), getMyCompletions()])
      .then(([p, c]) => {
        setProfile(p);
        setCompletions(c);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-dvh px-5 pt-14 pb-32 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h1
          className="text-3xl font-bold text-white leading-tight"
          style={{ fontFamily: "'ESPeak', sans-serif" }}
        >
          L&apos;espace jeu
        </h1>
        {profile !== null && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 flex-shrink-0 ml-3 mt-1">
            <Trophy className="w-4 h-4 text-[#FFCA44]" fill="currentColor" />
            <span className="text-[#FFCA44] font-bold text-sm">
              {profile.trophies ?? 0}
            </span>
          </div>
        )}
      </div>

      <p className="text-white/60 text-sm mb-7 leading-snug">
        Réalisez des challenges en équipe
        <br />
        ou des mini-jeux !
      </p>

      {/* Cards */}
      <div className="flex flex-col gap-4 mb-8">
        {/* Challenges card */}
        <Link
          href="/jeu/challenges"
          className="block active:scale-[0.97] transition-transform"
        >
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #1c2e6b 0%, #2a3d8f 100%)",
              height: 120,
            }}
          >
            {/* Text */}
            <div
              className="absolute inset-0 p-5 flex flex-col justify-center"
              style={{ maxWidth: "58%" }}
            >
              <p className="text-white font-bold text-xl leading-tight mb-1">
                Challenges
              </p>
              <p className="text-white/60 text-xs leading-snug">
                Réalise des challenges entre amis ou en famille
              </p>
            </div>

            {/* Illustration */}
            <img
              src="/card_challenge.png"
              alt=""
              className="absolute bottom-0 right-0 h-full object-contain object-bottom pointer-events-none"
              style={{ maxWidth: "48%" }}
            />
          </div>
        </Link>

        {/* Mini-jeu card */}
        <a
          href="https://game.xn--miroka-experience-jwb.fr/"
          target="_blank"
          rel="noopener noreferrer"
          className="block active:scale-[0.97] transition-transform"
        >
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #3b1a2e 0%, #5c2040 100%)",
              height: 120,
            }}
          >
            {/* Text */}
            <div
              className="absolute inset-0 p-5 flex flex-col justify-center"
              style={{ maxWidth: "58%" }}
            >
              <p className="text-white font-bold text-xl leading-tight mb-1">
                Mini-jeu
              </p>
              <p className="text-white/60 text-xs leading-snug">
                Réalise des challenges entre amis ou en famille
              </p>
            </div>

            {/* Illustration */}
            <img
              src="/rune.png"
              alt=""
              className="absolute right-4 top-1/2 -translate-y-1/2 object-contain pointer-events-none"
              style={{ width: 96, height: 96 }}
            />
          </div>
        </a>
      </div>

      {/* Challenges terminés */}
      <div className="mb-4">
        <h2
          className="text-white text-lg font-semibold mb-4"
          style={{ fontFamily: "'ESPeak', sans-serif" }}
        >
          Challenges terminés
        </h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-7 h-7 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          </div>
        ) : completions.length === 0 ? (
          <p className="text-white/30 text-sm">
            Aucun challenge terminé pour l&apos;instant.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {completions.map((c) => {
              const img = completionImage(c);
              const name = completionName(c);
              const cid = completionChallengeId(c);
              return (
                <Link
                  key={c._id}
                  href={`/jeu/challenge/${cid}`}
                  className="flex items-center gap-3 active:opacity-70 transition-opacity"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden bg-white/10">
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
                    <p className="text-white font-semibold text-sm">{name}</p>
                    <p className="text-white/40 text-xs mt-0.5">
                      Par{" "}
                      <span className="text-white font-semibold">
                        {profile?.firstName ?? "Moi"}
                      </span>{" "}
                      • {formatDate(c.completedAt)}
                    </p>
                  </div>

                  {/* Arrow button */}
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                    <ChevronRight className="w-4 h-4 text-white/50" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
