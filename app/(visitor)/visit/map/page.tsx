"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getGroupId, getGroup } from "@/lib/visit";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

interface ApiModule {
  _id: string;
  number: number;
  name: string;
  mapX?: number;
  mapY?: number;
}

export default function MapPage() {
  const router = useRouter();
  const [modules, setModules] = useState<ApiModule[]>([]);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Charger les modules
    fetch(`${API}/modules`)
      .then((r) => r.json())
      .then((data) => setModules(data.filter((m: ApiModule) => m.mapX !== undefined)))
      .catch(() => {});

    // Charger les modules déjà visités
    const groupId = getGroupId();
    if (groupId) {
      getGroup(groupId)
        .then((group) => {
          setCompletedModules(group.completedModules ?? []);
          setParticipants(group.participants?.map((p: { name: string }) => p.name) ?? []);
        })
        .catch(() => {});
    } else {
      const saved = localStorage.getItem("visit_participants");
      if (saved) setParticipants(JSON.parse(saved));
    }
  }, []);

  function handleModuleClick(mod: ApiModule) {
    router.push(`/visit/module/${mod._id}?number=${mod.number}`);
  }

  const allVisited = modules.length > 0 && modules.every((m) => completedModules.includes(m.number));

  return (
    <div className="flex flex-col min-h-dvh bg-[#0a0a0a]">
      {/* Header */}
      <div className="px-5 pt-10 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Plan de l&apos;expérience</h1>
          <p className="text-white/50 text-xs mt-0.5">
            {completedModules.length}/{modules.length} modules visités
          </p>
        </div>
        <div className="flex -space-x-2">
          {participants.slice(0, 4).map((name, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full bg-purple-600 border-2 border-[#0a0a0a] flex items-center justify-center text-xs font-bold text-white"
            >
              {name[0]?.toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      {/* Barre de progression */}
      <div className="px-5 mb-4">
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 rounded-full transition-all duration-500"
            style={{ width: modules.length ? `${(completedModules.length / modules.length) * 100}%` : "0%" }}
          />
        </div>
      </div>

      {/* Plan */}
      <div className="flex-1 px-4 pb-4">
        <div
          ref={imgRef}
          className="relative w-full rounded-2xl overflow-hidden"
          style={{
            backgroundImage: "url('/mirokai-plan.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            aspectRatio: "1536/1418",
          }}
        >
          <div className="absolute inset-0 bg-black/30" />

          {modules.map((mod) => {
            const visited = completedModules.includes(mod.number);
            return (
              <button
                key={mod._id}
                onClick={() => handleModuleClick(mod)}
                style={{
                  position: "absolute",
                  left: `${(mod.mapX ?? 0) * 100}%`,
                  top: `${(mod.mapY ?? 0) * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold shadow-lg transition-all active:scale-95 z-10 ${
                  visited
                    ? "bg-[#f5c842] border-[#f5c842] text-black"
                    : "bg-purple-600 border-purple-400 text-white animate-pulse"
                }`}
              >
                {mod.number}
              </button>
            );
          })}
        </div>
      </div>

      {/* Légende */}
      <div className="px-5 pb-4 flex items-center gap-4 text-xs text-white/50">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-purple-600" />
          À visiter
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#f5c842]" />
          Visité
        </div>
      </div>

      {/* Bouton fin de visite */}
      {allVisited && (
        <div className="px-5 pb-8">
          <button
            onClick={() => router.push("/visit/end")}
            className="w-full py-4 rounded-full bg-[#f5c842] text-black font-semibold text-base active:scale-95 transition-all"
          >
            Terminer la visite 🎉
          </button>
        </div>
      )}
    </div>
  );
}
