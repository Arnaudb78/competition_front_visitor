"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { ChevronLeft, CheckCircle } from "lucide-react";
import { completeModule, addScore, getGroupId } from "@/lib/visit";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

interface Module {
  _id: string;
  number: number;
  name: string;
  cartel?: string;
  mediaType: "video" | "audio" | "image" | "none";
  mediaUrl?: string;
  images: string[];
}

export default function ModulePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const moduleNumber = Number(searchParams.get("number") ?? 0);

  const [mod, setMod] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [visited, setVisited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API}/modules/${params.id}`)
      .then((r) => r.json())
      .then(setMod)
      .catch(() => {})
      .finally(() => setLoading(false));

    // Participants pour attribution de score
    const saved = localStorage.getItem("visit_participants");
    if (saved) setParticipants(JSON.parse(saved));
  }, [params.id]);

  async function handleValidate() {
    if (!mod) return;
    setSaving(true);
    try {
      await completeModule(moduleNumber || mod.number);
      // Ajoute 100 points au participant sélectionné (ou tous si solo)
      if (participants.length === 1) {
        await addScore(participants[0], 100);
      } else if (selected) {
        await addScore(selected, 100);
      }
      setVisited(true);
    } catch {
      setVisited(true);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <p className="text-white/40 text-sm animate-pulse">Chargement…</p>
      </div>
    );
  }

  if (!mod) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh gap-4 px-6">
        <p className="text-white/60 text-sm text-center">Module introuvable</p>
        <button onClick={() => router.back()} className="text-purple-400 text-sm">
          ← Retour
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[#0a0a0a]">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-10 pb-4">
        <button onClick={() => router.back()} className="text-white/60 hover:text-white transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="text-white/40 text-xs tracking-widest uppercase">
          Module {mod.number}
        </span>
      </div>

      <div className="flex-1 px-5 flex flex-col gap-6 overflow-y-auto pb-32">
        {/* Titre */}
        <h1 className="text-2xl font-bold text-white">{mod.name}</h1>

        {/* Média */}
        {mod.mediaType === "video" && mod.mediaUrl && (
          <video
            src={mod.mediaUrl}
            controls
            playsInline
            className="w-full rounded-2xl bg-black"
          />
        )}
        {mod.mediaType === "audio" && mod.mediaUrl && (
          <audio src={mod.mediaUrl} controls className="w-full" />
        )}
        {mod.mediaType === "image" && mod.mediaUrl && (
          <img src={mod.mediaUrl} alt={mod.name} className="w-full rounded-2xl object-cover" />
        )}

        {/* Images supplémentaires */}
        {mod.images.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {mod.images.map((url, i) => (
              <img key={i} src={url} alt="" className="w-full aspect-square object-cover rounded-xl" />
            ))}
          </div>
        )}

        {/* Description */}
        {mod.cartel && (
          <p className="text-white/70 text-sm leading-relaxed">{mod.cartel}</p>
        )}

        {/* Sélection participant si groupe */}
        {!visited && participants.length > 1 && (
          <div className="flex flex-col gap-3">
            <p className="text-white/60 text-sm font-medium">
              Qui a visité ce module ?
            </p>
            <div className="flex flex-wrap gap-2">
              {participants.map((name) => (
                <button
                  key={name}
                  onClick={() => setSelected(name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selected === name
                      ? "bg-[#f5c842] text-black"
                      : "bg-white/10 text-white/70 border border-white/20"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bouton valider */}
      <div className="fixed bottom-0 inset-x-0 px-5 pb-8 pt-4 bg-gradient-to-t from-[#0a0a0a] to-transparent">
        {visited ? (
          <div className="flex items-center justify-center gap-2 py-4 text-[#f5c842]">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Module visité !</span>
          </div>
        ) : (
          <button
            onClick={handleValidate}
            disabled={saving || (participants.length > 1 && !selected)}
            className="w-full py-4 rounded-full bg-[#f5c842] text-black font-semibold text-base active:scale-95 disabled:opacity-40 transition-all"
          >
            {saving ? "Validation…" : "J'ai visité ce module"}
          </button>
        )}
      </div>
    </div>
  );
}
