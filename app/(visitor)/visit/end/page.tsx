"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Share2, UserPlus } from "lucide-react";
import { getGroupId, getGroup, endVisit } from "@/lib/visit";

interface Participant {
  name: string;
  score: number;
}

export default function EndPage() {
  const router = useRouter();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const id = getGroupId();
      if (id) {
        try {
          await endVisit();
          const group = await getGroup(id);
          const sorted = [...group.participants].sort(
            (a: Participant, b: Participant) => b.score - a.score,
          );
          setParticipants(sorted);
        } catch {
          const saved = localStorage.getItem("visit_participants");
          if (saved) {
            setParticipants(
              JSON.parse(saved).map((name: string) => ({ name, score: 0 })),
            );
          }
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  function handleShare() {
    const url = `${window.location.origin}/`;
    if (navigator.share) {
      navigator
        .share({
          title: "Mirokaï Experience",
          text: "J'ai visité la Mirokaï Experience ! Crée ton compte pour revivre l'aventure.",
          url,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
    }
  }

  const winner = participants[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <p className="text-white/40 animate-pulse text-sm">
          Calcul des scores…
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[#0a0a0a] px-6 pt-12 pb-8">
      {/* Trophy */}
      <div className="flex flex-col items-center gap-4 mb-10">
        <div className="w-20 h-20 rounded-full bg-[#f5c842]/10 flex items-center justify-center">
          <Trophy className="w-10 h-10 text-[#f5c842]" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Fin de la visite !</h1>
          <p className="text-white/50 text-sm mt-1">
            Merci d&apos;avoir exploré la Mirokaï Experience
          </p>
        </div>
      </div>

      {/* Gagnant */}
      {winner && participants.length > 1 && (
        <div className="bg-[#f5c842]/10 border border-[#f5c842]/30 rounded-2xl p-4 mb-6 text-center">
          <p className="text-[#f5c842] text-xs uppercase tracking-widest font-semibold mb-1">
            🏆 Gagnant
          </p>
          <p className="text-white text-xl font-bold">{winner.name}</p>
          <p className="text-white/50 text-sm">{winner.score} points</p>
        </div>
      )}

      {/* Classement */}
      {participants.length > 0 && (
        <div className="flex flex-col gap-3 mb-8">
          <p className="text-white/40 text-xs uppercase tracking-widest">
            Classement
          </p>
          {participants.map((p, i) => (
            <div
              key={p.name}
              className="flex items-center gap-4 bg-white/5 rounded-2xl px-4 py-3"
            >
              <span
                className={`text-lg font-bold w-6 ${i === 0 ? "text-[#f5c842]" : "text-white/30"}`}
              >
                {i + 1}
              </span>
              <span className="flex-1 text-white font-medium">{p.name}</span>
              <span className="text-white/60 text-sm">{p.score} pts</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 mt-auto">
        <button
          onClick={handleShare}
          className="w-full py-4 rounded-full bg-purple-600 text-white font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Share2 className="w-5 h-5" />
          Partager mes résultats
        </button>
        <button
          onClick={() => router.push("/?tab=signup")}
          className="w-full py-4 rounded-full bg-[#f5c842] text-black font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <UserPlus className="w-5 h-5" />
          Créer mon compte
        </button>
      </div>
    </div>
  );
}
