"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, Minus } from "lucide-react";
import { createGroup, ParticipantInput } from "@/lib/visit";

interface ParticipantForm {
  name: string;
  age: number;
}

export default function ParticipantsPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [count, setCount] = useState(1);
  const [participants, setParticipants] = useState<ParticipantForm[]>([{ name: "", age: 18 }]);
  const [loading, setLoading] = useState(false);

  function updateCount(n: number) {
    const next = Math.max(1, Math.min(10, n));
    setCount(next);
    setParticipants((prev) => {
      const arr = [...prev];
      while (arr.length < next) arr.push({ name: "", age: 18 });
      return arr.slice(0, next);
    });
  }

  function updateName(i: number, value: string) {
    setParticipants((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, name: value } : p))
    );
  }

  function updateAge(i: number, delta: number) {
    setParticipants((prev) =>
      prev.map((p, idx) =>
        idx === i ? { ...p, age: Math.max(1, Math.min(99, p.age + delta)) } : p
      )
    );
  }

  async function handleContinue() {
    if (step === 1) {
      setStep(2);
    } else {
      const filled = participants.filter((p) => p.name.trim().length > 0);
      if (filled.length === 0) return;
      setLoading(true);
      const payload: ParticipantInput[] = filled.map((p) => ({
        name: p.name.trim(),
        age: p.age,
      }));
      try {
        await createGroup(payload);
        router.push("/visit/map");
      } catch {
        localStorage.setItem(
          "visit_participants",
          JSON.stringify(payload.map((p) => p.name))
        );
        router.push("/visit/map");
      } finally {
        setLoading(false);
      }
    }
  }

  const canContinue =
    step === 1 || participants.some((p) => p.name.trim().length > 0);

  return (
    <div
      className="relative flex flex-col min-h-dvh overflow-hidden"
      style={{
        backgroundImage: `url('/${step === 1 ? "onboarding1" : "onboarding2"}.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay sombre */}
      <div className="absolute inset-0" />

      {/* Contenu */}
      <div className="relative z-10 flex flex-col flex-1 px-6 pt-12 pb-8">
        {/* Header */}
        <div className="flex flex-col gap-3 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => (step === 2 ? setStep(1) : router.push("/visit"))}
              className="text-white/70 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="text-white/60 text-sm">Étape {step}/2</span>
          </div>
          {/* Barre de progression */}
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#f5c842] rounded-full transition-all duration-500"
              style={{ width: step === 1 ? "50%" : "100%" }}
            />
          </div>
        </div>

        {/* Étape 1 — Nombre de participants */}
        {step === 1 && (
          <div className="flex flex-col flex-1">
            <h1 className="text-2xl font-bold text-white text-center mb-2">
              Combien êtes-vous ?
            </h1>
            <p className="text-white/60 text-sm text-center mb-8">
              Sélectionnez le nombre de participants à la Mirokaï Expérience
            </p>

            <p className="text-white font-semibold text-center mb-6">
              Combien êtes-vous ?
            </p>

            {/* Compteur */}
            <div className="flex items-center justify-center gap-8">
              <button
                onClick={() => updateCount(count - 1)}
                className="text-white/70 hover:text-white transition-colors w-10 h-10 flex items-center justify-center"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="text-5xl font-bold text-white w-16 text-center">
                {count}
              </span>
              <button
                onClick={() => updateCount(count + 1)}
                className="text-white/70 hover:text-white transition-colors w-10 h-10 flex items-center justify-center"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Étape 2 — Prénoms + âges */}
        {step === 2 && (
          <div className="flex flex-col flex-1">
            <h1 className="text-2xl font-bold text-white text-center mb-2">
              Ajoutez les membres de votre équipe
            </h1>
            <p className="text-white/60 text-sm text-center mb-8">
              Ajoutez les membres de votre équipe pour participer ensemble aux
              challenges
            </p>

            <div className="flex flex-col gap-4 overflow-y-auto flex-1">
              {participants.map((p, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-white/10 text-white/60 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <input
                      type="text"
                      placeholder={`Prénom du participant ${i + 1}`}
                      value={p.name}
                      onChange={(e) => updateName(i, e.target.value)}
                      className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#f5c842] transition-colors"
                    />
                  </div>

                  {/* Compteur d'âge */}
                  <div className="ml-10 flex items-center gap-3">
                    <span className="text-white/50 text-xs">Âge</span>
                    <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-2">
                      <button
                        type="button"
                        onClick={() => updateAge(i, -1)}
                        className="text-white/60 hover:text-white transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-white font-semibold text-sm w-8 text-center">
                        {p.age}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateAge(i, 1)}
                        className="text-white/60 hover:text-white transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bouton Continuer */}
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className="mt-6 w-full py-4 rounded-full bg-[#f5c842] hover:bg-[#f0bc2e] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold text-black text-base shadow-lg"
        >
          {loading ? "Création..." : "Continuer"}
        </button>
      </div>
    </div>
  );
}
