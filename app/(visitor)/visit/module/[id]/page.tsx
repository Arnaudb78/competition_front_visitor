"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { ChevronLeft, Play } from "lucide-react";
import { completeModule, addScore, getGroup, getGroupId } from "@/lib/visit";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

interface Answer {
  text: string;
  isCorrect: boolean;
}

interface Question {
  _id: string;
  text: string;
  ageGroup: "child" | "adult";
  answers: Answer[];
}

interface Module {
  _id: string;
  number: number;
  name: string;
  cartel?: string;
  mediaType: "video" | "audio" | "image" | "none";
  mediaUrl?: string;
  images: string[];
  childQuestion?: Question;
  adultQuestion?: Question;
}

interface Participant {
  name: string;
  age: number;
}

type Phase = "video" | "question" | "score_board" | "completed";

function getQuestion(participant: Participant, mod: Module): Question | null {
  return participant.age <= 12
    ? (mod.childQuestion ?? null)
    : (mod.adultQuestion ?? null);
}

export default function ModulePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const moduleNumber = Number(searchParams.get("number") ?? 0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [mod, setMod] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);

  const [phase, setPhase] = useState<Phase>("video");
  const [videoStarted, setVideoStarted] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  // Question state
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  // Score board state
  const [scores, setScores] = useState<Record<string, number>>({});
  const [barsVisible, setBarsVisible] = useState(false);

  // Ref for stable access in timeouts
  const stateRef = useRef({ currentPlayerIndex, participants, mod });
  useEffect(() => {
    stateRef.current = { currentPlayerIndex, participants, mod };
  });

  useEffect(() => {
    fetch(`${API}/modules/${params.id}`)
      .then((r) => r.json())
      .then(setMod)
      .catch(() => {})
      .finally(() => setLoading(false));

    const saved = localStorage.getItem("visit_participants_data");
    if (saved) {
      const parts: Participant[] = JSON.parse(saved);
      setParticipants(parts);
      // Init scores à 0
      const init: Record<string, number> = {};
      parts.forEach((p) => (init[p.name] = 0));
      setScores(init);
    } else {
      const names = localStorage.getItem("visit_participants");
      if (names) {
        const arr: string[] = JSON.parse(names);
        setParticipants(arr.map((name) => ({ name, age: 18 })));
        const init: Record<string, number> = {};
        arr.forEach((n) => (init[n] = 0));
        setScores(init);
      }
    }

    // Charger les scores existants depuis l'API (modules déjà visités)
    const groupId = getGroupId();
    if (groupId) {
      getGroup(groupId)
        .then((group: any) => {
          const s: Record<string, number> = {};
          group.participants?.forEach((p: any) => {
            s[p.name] = p.score || 0;
          });
          setScores(s);
        })
        .catch(() => {});
    }
  }, [params.id]);

  function handleVideoPlay() {
    setVideoStarted(true);
    videoRef.current?.play();
  }

  function handleVideoEnded() {
    setFadeOut(true);
    setTimeout(() => {
      const { participants: parts, mod: m } = stateRef.current;
      if (parts.length > 0 && m) {
        setPhase("question");
        setShowOverlay(true);
      } else if (m) {
        doFinishModule(m);
      }
    }, 500);
  }

  async function doFinishModule(m: Module) {
    try {
      await completeModule(moduleNumber || m.number);
    } catch {}
    setPhase("completed");
  }

  function afterAnswer() {
    const { currentPlayerIndex: idx, participants: parts, mod: m } = stateRef.current;
    if (!m) return;
    const nextIdx = idx + 1;
    if (nextIdx < parts.length) {
      setCurrentPlayerIndex(nextIdx);
      setSelectedAnswer(null);
      setAnswerRevealed(false);
      setShowOverlay(true);
      setPhase("question");
    } else {
      doFinishModule(m);
    }
  }

  // Score board : auto-avance après 3.5s, annulé si l'utilisateur tape
  useEffect(() => {
    if (phase !== "score_board") return;
    const t1 = setTimeout(() => setBarsVisible(true), 80);
    const t2 = setTimeout(() => afterAnswer(), 3500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleScoreBoardTap() {
    if (phase !== "score_board") return;
    afterAnswer();
  }

  async function handleAnswerSelect(index: number) {
    if (answerRevealed || !mod) return;
    const player = participants[currentPlayerIndex];
    const question = getQuestion(player, mod);
    if (!question) return;

    setSelectedAnswer(index);
    setAnswerRevealed(true);

    if (question.answers[index].isCorrect) {
      addScore(player.name, 100); // fire & forget
      setScores((prev) => ({ ...prev, [player.name]: (prev[player.name] || 0) + 100 }));
    }

    setTimeout(() => {
      const { currentPlayerIndex: idx, participants: parts } = stateRef.current;
      if (idx === parts.length - 1) {
        setBarsVisible(false);
        setPhase("score_board");
      } else {
        afterAnswer();
      }
    }, 1200);
  }

  function handleSkip() {
    const { currentPlayerIndex: idx, participants: parts } = stateRef.current;
    if (idx === parts.length - 1) {
      setBarsVisible(false);
      setPhase("score_board");
    } else {
      afterAnswer();
    }
  }

  function dismissOverlay() {
    setShowOverlay(false); // l'index est déjà à jour (avancé dans afterAnswer ou 0 pour J1)
  }

  /* ──────────────────────────────────────── */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-black">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    );
  }

  if (!mod) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh gap-4 px-6">
        <p className="text-white/60 text-sm">Module introuvable</p>
        <button onClick={() => router.back()} className="text-purple-400 text-sm">
          ← Retour
        </button>
      </div>
    );
  }

  /* ─── VIDEO ─── */
  if (phase === "video") {
    const hasVideo = mod.mediaType === "video" && mod.mediaUrl;
    const hasImage = mod.mediaType === "image" && mod.mediaUrl;

    return (
      <div className="relative min-h-dvh bg-black overflow-hidden">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="absolute top-10 left-5 z-20 text-white/80 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Video plein écran portrait */}
        {hasVideo && (
          <video
            ref={videoRef}
            src={mod.mediaUrl!}
            playsInline
            onEnded={handleVideoEnded}
            onWaiting={() => setBuffering(true)}
            onCanPlay={() => setBuffering(false)}
            onPlaying={() => setBuffering(false)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Image plein écran */}
        {hasImage && (
          <img
            src={mod.mediaUrl!}
            alt={mod.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Pas de média */}
        {!hasVideo && !hasImage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
            <p className="text-white/40 text-sm mb-2">Module {mod.number}</p>
            <h1 className="text-2xl font-bold text-white">{mod.name}</h1>
            {mod.cartel && (
              <p className="text-white/60 text-sm mt-4 leading-relaxed">{mod.cartel}</p>
            )}
          </div>
        )}

        {/* Play overlay (avant lancement) */}
        {hasVideo && !videoStarted && (
          <button
            onClick={handleVideoPlay}
            className="absolute inset-0 z-10 flex items-center justify-center"
          >
            <div className="w-[72px] h-[72px] rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-9 h-9 text-white fill-white ml-1" />
            </div>
          </button>
        )}

        {/* Buffering spinner */}
        {hasVideo && videoStarted && buffering && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          </div>
        )}

        {/* Overlay fade-to-black à la fin de la vidéo */}
        <div
          className="absolute inset-0 z-20 bg-black pointer-events-none"
          style={{ opacity: fadeOut ? 1 : 0, transition: "opacity 0.5s ease-in-out" }}
        />

        {/* Titre module en bas */}
        <div className="absolute bottom-0 inset-x-0 z-10 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-6 pb-10 pt-24 pointer-events-none">
          <p className="text-white/60 text-sm font-medium">Module {mod.number}</p>
          <h2 className="text-white text-xl font-bold mt-0.5">{mod.name}</h2>
        </div>

        {/* Bouton si pas de vidéo */}
        {!hasVideo && (
          <div className="absolute bottom-0 inset-x-0 z-20 px-6 pb-10">
            <button
              onClick={() => {
                if (participants.length > 0) { setPhase("question"); setShowOverlay(true); }
                else doFinishModule(mod);
              }}
              className="w-full py-4 rounded-full bg-[#f5c842] text-black font-semibold text-base active:scale-95 transition-all"
            >
              {participants.length > 0 ? "Répondre aux questions" : "Terminer le module"}
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ─── QUESTIONS ─── */
  if (phase === "question") {
    const player = participants[currentPlayerIndex];
    const question = player ? getQuestion(player, mod) : null;

    // Joueur sans question : skip
    if (player && !question && !showOverlay) {
      const nextIdx = currentPlayerIndex + 1;
      if (nextIdx < participants.length) {
        setCurrentPlayerIndex(nextIdx);
        setShowOverlay(true);
      } else {
        doFinishModule(mod);
      }
      return (
        <div className="flex items-center justify-center min-h-dvh bg-[#0d0b1e]">
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        </div>
      );
    }

    if (!player) {
      return (
        <div className="flex items-center justify-center min-h-dvh bg-[#0d0b1e]">
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        </div>
      );
    }

    return (
      <div className="relative flex flex-col min-h-dvh bg-[#0d0b1e] animate-fade-in-up">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="absolute top-10 left-5 z-10 text-white/70 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="px-5 pt-10 pb-4 text-center">
          <p className="text-white/50 text-sm">Au tour de</p>
          <p className="text-white font-bold text-xl">{player.name}</p>
        </div>

        {/* Contenu */}
        {question && (
          <div className="flex-1 px-5 flex flex-col gap-5 pb-10 overflow-y-auto">
            <div>
              <p className="text-white/50 text-sm mb-2">
                Module {mod.number} - {mod.name}
              </p>
              <h2 className="text-2xl font-bold text-white leading-tight">{question.text}</h2>
              <p className="text-white/50 text-sm mt-3">Choisissez une seule réponse</p>
            </div>

            {/* Réponses 2×2 */}
            <div className="grid grid-cols-2 gap-3">
              {question.answers.map((answer, i) => {
                let cls =
                  "py-6 px-4 rounded-2xl border-2 text-sm text-center transition-all active:scale-95 disabled:cursor-default leading-snug flex items-center justify-center min-h-[100px] font-medium";
                if (answerRevealed) {
                  if (answer.isCorrect) {
                    cls += " bg-[#3d1d6e] border-[#9b59d0] text-white font-bold";
                  } else if (selectedAnswer === i) {
                    cls += " bg-[#1a1a3e]/60 border-[#3b3b8a]/50 text-white/30";
                  } else {
                    cls += " bg-[#1a1a3e]/30 border-[#3b3b8a]/30 text-white/20";
                  }
                } else {
                  cls += " bg-[#1a1a3e] border-[#3b3b8a] text-white";
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswerSelect(i)}
                    disabled={answerRevealed}
                    className={cls}
                  >
                    {answer.text}
                  </button>
                );
              })}
            </div>

            {/* Skip */}
            {!answerRevealed && (
              <button
                onClick={handleSkip}
                className="text-white/40 text-sm text-left mt-1"
              >
                Je ne souhaite pas répondre
              </button>
            )}
          </div>
        )}

        {/* Overlay "Au tour de [joueur courant]" — centré, avatar qui dépasse */}
        {showOverlay && (
          <button
            onClick={dismissOverlay}
            className="absolute inset-0 z-20 flex items-center justify-center px-6"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
          >
            <div className="relative bg-white rounded-3xl px-8 pt-10 pb-7 text-center shadow-2xl w-full max-w-sm mt-8">
              {/* Avatar dépasse au-dessus de la card */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <img src="/avatar.png" alt="" className="w-full h-full object-cover" />
              </div>
              <p className="text-black font-bold text-2xl">
                Au tour de {player.name} !
              </p>
            </div>
          </button>
        )}
      </div>
    );
  }

  /* ─── SCORE BOARD ─── */
  if (phase === "score_board") {
    const scoreValues = participants.map((p) => scores[p.name] || 0);
    const maxScore = Math.max(...scoreValues, 1);
    const leaderScore = Math.max(...scoreValues);
    // Largeur de barre selon nb de joueurs
    const barCount = participants.length;
    const barMaxW = barCount === 1 ? 80 : barCount <= 3 ? 72 : barCount <= 5 ? 60 : barCount <= 7 ? 48 : 38;

    return (
      <button
        onClick={handleScoreBoardTap}
        className="relative h-dvh w-full overflow-hidden flex flex-col animate-fade-in-up text-left"
        style={{
          background: "radial-gradient(ellipse at bottom center, #3b0764 0%, #0d0b1e 65%)",
        }}
      >
        {/* Header */}
        <div className="flex-shrink-0 px-6 pt-14 pb-4 text-center pointer-events-none">
          <p className="text-white/50 text-xs uppercase tracking-widest mb-1">
            Module {mod?.number} — {mod?.name}
          </p>
          <h2 className="text-2xl font-bold text-white">Bien joué !</h2>
        </div>

        {/* Barres */}
        <div className="flex-1 flex items-end justify-center gap-3 px-4 pb-14 pointer-events-none">
          {participants.map((p, i) => {
            const score = scores[p.name] || 0;
            const isLeader = score > 0 && score === leaderScore;
            // Hauteur max 52vh pour le leader, proportionnelle pour les autres
            const targetH = maxScore > 0 ? Math.max((score / maxScore) * 52, score > 0 ? 8 : 2) : 2;

            return (
              <div
                key={p.name}
                className="flex flex-col items-center"
                style={{ width: barMaxW, maxWidth: barMaxW, flexShrink: 0 }}
              >
                {/* Score */}
                <p
                  className="text-xs font-bold mb-1 transition-opacity duration-500"
                  style={{
                    color: isLeader ? "#f5c842" : "rgba(255,255,255,0.6)",
                    opacity: barsVisible ? 1 : 0,
                  }}
                >
                  {score} pts
                </p>

                {/* Avatar */}
                <div
                  className="rounded-full overflow-hidden border-2 mb-0 transition-all duration-500 flex-shrink-0"
                  style={{
                    width: isLeader ? 48 : 38,
                    height: isLeader ? 48 : 38,
                    borderColor: isLeader ? "#f5c842" : "rgba(255,255,255,0.3)",
                    opacity: barsVisible ? 1 : 0,
                    transform: barsVisible ? "scale(1)" : "scale(0.5)",
                  }}
                >
                  <img src="/avatar.png" alt="" className="w-full h-full object-cover" />
                </div>

                {/* Barre animée */}
                <div
                  className="w-full rounded-t-xl flex-shrink-0"
                  style={{
                    height: barsVisible ? `${targetH}vh` : "0px",
                    transition: `height ${0.7 + i * 0.08}s cubic-bezier(0.34, 1.56, 0.64, 1)`,
                    background: isLeader
                      ? "linear-gradient(to top, #c97c00, #f5c842)"
                      : "linear-gradient(to top, rgba(255,255,255,0.12), rgba(255,255,255,0.28))",
                  }}
                />

                {/* Nom */}
                <p
                  className="text-white/50 text-xs mt-1 truncate w-full text-center transition-opacity duration-500"
                  style={{ opacity: barsVisible ? 1 : 0 }}
                >
                  {p.name}
                </p>
              </div>
            );
          })}
        </div>

        {/* Hint */}
        <p className="absolute bottom-4 inset-x-0 text-center text-white/25 text-xs pointer-events-none">
          Appuyer pour continuer
        </p>
      </button>
    );
  }

  /* ─── COMPLETED ─── */
  const hasKids = participants.some((p) => p.age <= 12);
  const finishImg = hasKids ? "/kids_finish_module.png" : "/adult_finish_module.png";

  return (
    <div className="relative h-dvh overflow-hidden bg-[#0d0b1e] flex flex-col">
      {/* Texte + avatars en haut */}
      <div className="flex-shrink-0 px-6 pt-10 text-center">
        {participants.length > 0 && (
          <div className="flex justify-center -space-x-3 mb-5">
            {participants.map((p, i) => (
              <div
                key={i}
                className="w-12 h-12 rounded-full border-2 border-[#0d0b1e] flex items-center justify-center text-white font-bold text-sm"
                style={{ background: i % 2 === 0 ? "#7c3aed" : "#2563eb" }}
              >
                {p.name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
        )}
        <h2 className="text-3xl font-bold text-white">Super !</h2>
        <p className="text-white/60 text-base mt-2">Prêts à continuer l'aventure ?</p>
      </div>

      {/* Image remplit l'espace restant, ancrée en bas */}
      <div className="flex-1 relative min-h-0">
        <img
          src={finishImg}
          alt=""
          className="absolute inset-0 w-full h-full object-contain object-bottom"
        />
      </div>

      {/* Bouton fixé en bas */}
      <div className="absolute bottom-0 inset-x-0 px-6 pb-8">
        <button
          onClick={() => router.push("/visit/map")}
          className="w-full py-4 rounded-full bg-[#f5c842] text-black font-semibold text-base active:scale-95 transition-all"
        >
          Retour à la map
        </button>
      </div>
    </div>
  );
}
