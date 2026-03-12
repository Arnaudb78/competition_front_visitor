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
  const [participants, setParticipants] = useState<ParticipantForm[]>([
    { name: "", age: 18 },
  ]);
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
      prev.map((p, idx) => (idx === i ? { ...p, name: value } : p)),
    );
  }

  function updateAge(i: number, delta: number) {
    setParticipants((prev) =>
      prev.map((p, idx) =>
        idx === i ? { ...p, age: Math.max(1, Math.min(99, p.age + delta)) } : p,
      ),
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
          JSON.stringify(payload.map((p) => p.name)),
        );
        router.push("/visit/map");
      } finally {
        setLoading(false);
      }
    }
  }

  const canContinue =
    step === 1 || participants.some((p) => p.name.trim().length > 0);

  // ─── Shared header ───────────────────────────────────────────────────────────

  const Header = () => (
    <div className="flex-shrink-0 px-6 pt-12 pb-4">
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={() => (step === 2 ? setStep(1) : router.push("/visit"))}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-white/80" />
        </button>
        <span className="text-white/50 text-sm">Étape {step}/2</span>
      </div>
      <div className="h-1 bg-white/15 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#f5c842] rounded-full transition-all duration-500"
          style={{ width: step === 1 ? "50%" : "100%" }}
        />
      </div>
    </div>
  );

  // ─── STEP 1 — Nombre de participants ─────────────────────────────────────────

  if (step === 1) {
    return (
      <div
        className="relative flex flex-col h-dvh overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse at 60% 100%, rgba(140, 40, 160, 0.45) 0%, transparent 55%),
            radial-gradient(ellipse at 20% 60%, rgba(100, 20, 140, 0.25) 0%, transparent 50%),
            #0d0b1e
          `,
        }}
      >
        <Header />

        {/* Text + counter */}
        <div className="flex-shrink-0 px-6 pt-2 text-center">
          <h1 className="text-3xl font-bold text-white mb-3">
            Combien êtes-vous ?
          </h1>
          <p className="text-white/50 text-sm leading-relaxed">
            Sélectionnez le nombre de participants
            <br />à la Mirokaï Expérience
          </p>

          <div className="flex items-center justify-center gap-8 mt-10">
            <button
              onClick={() => updateCount(count - 1)}
              className="text-white/60 text-3xl font-light w-12 h-12 flex items-center justify-center active:scale-90 transition-transform select-none"
            >
              —
            </button>
            <span className="text-7xl font-bold text-white w-24 text-center tabular-nums">
              {count}
            </span>
            <button
              onClick={() => updateCount(count + 1)}
              className="text-white/60 text-3xl font-light w-12 h-12 flex items-center justify-center active:scale-90 transition-transform select-none"
            >
              +
            </button>
          </div>
        </div>

        {/* Character image — very large, centered, bleeds off bottom */}
        <img
          src="/miroki_onboarding.png"
          alt=""
          className="absolute pointer-events-none"
          style={{
            bottom: "-38vh",
            left: "50%",
            transform: "translateX(-40%)",
            height: "100vh",
            width: "auto",
          }}
        />

        {/* CTA — pinned at bottom */}
        <div className="absolute bottom-0 inset-x-0 px-6 pb-10">
          <button
            onClick={handleContinue}
            className="w-full py-4 rounded-full font-semibold text-base text-black active:scale-95 transition-all shadow-lg"
            style={{ background: "#f5c842" }}
          >
            Continuer
          </button>
        </div>
      </div>
    );
  }

  // ─── STEP 2 — Prénoms + âges ──────────────────────────────────────────────────

  return (
    <div
      className="flex flex-col h-dvh overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse at 80% 100%, rgba(140, 40, 160, 0.3) 0%, transparent 55%),
          radial-gradient(ellipse at 20% 80%, rgba(100, 20, 140, 0.2) 0%, transparent 50%),
          #0d0b1e
        `,
      }}
    >
      <Header />

      {/* Title */}
      <div className="flex-shrink-0 px-6 pb-4 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Qui participe ?</h1>
        <p className="text-white/50 text-sm leading-relaxed">
          Renseignez le prénom et l&apos;âge de chaque participant
        </p>
      </div>

      {/* Form — scrollable */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        <div className="flex flex-col gap-4">
          {participants.map((p, i) => (
            <div
              key={i}
              className="rounded-2xl p-4"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="w-7 h-7 rounded-full bg-white/10 text-white/50 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <input
                  type="text"
                  placeholder={`Prénom du participant ${i + 1}`}
                  value={p.name}
                  onChange={(e) => updateName(i, e.target.value)}
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pl-10">
                <span className="text-white/40 text-xs">Âge</span>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => updateAge(i, -1)}
                    className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <Minus className="w-3.5 h-3.5 text-white/70" />
                  </button>
                  <span className="text-white font-semibold text-sm w-8 text-center tabular-nums">
                    {p.age}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateAge(i, 1)}
                    className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <Plus className="w-3.5 h-3.5 text-white/70" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex-shrink-0 px-6 pb-10 pt-4">
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className="w-full py-4 rounded-full font-semibold text-base text-black active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg"
          style={{ background: "#f5c842" }}
        >
          {loading ? "Création..." : "Continuer"}
        </button>
      </div>
    </div>
  );
}
